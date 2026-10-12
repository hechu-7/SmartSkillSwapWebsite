package com.skillswap.service;

import com.skillswap.dto.FeedbackCreateDto;
import com.skillswap.dto.SessionBookingRequestDto;
import com.skillswap.dto.SessionDto;
import com.skillswap.dto.SessionFeedbackDto;
import com.skillswap.entity.*;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ConflictException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final SkillSessionRepository sessionRepository;
    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;
    private final SessionFeedbackRepository feedbackRepository;
    private final SwapPointsTransactionRepository pointsTransactionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public SessionService(
            SkillSessionRepository sessionRepository,
            AvailabilityRepository availabilityRepository,
            UserRepository userRepository,
            SessionFeedbackRepository feedbackRepository,
            SwapPointsTransactionRepository pointsTransactionRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.sessionRepository = sessionRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
        this.feedbackRepository = feedbackRepository;
        this.pointsTransactionRepository = pointsTransactionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public SessionDto bookSession(Long learnerId, SessionBookingRequestDto dto) {
        if (learnerId.equals(dto.getMentorId())) {
            throw new BadRequestException("You cannot book a learning session with yourself");
        }

        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BadRequestException("Session start time must be before end time");
        }

        if (dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book a session in the past");
        }

        User learner = userRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found"));
        User mentor = userRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found with id: " + dto.getMentorId()));

        // Check for overlapping confirmed or requested sessions
        if (sessionRepository.existsOverlappingSession(dto.getMentorId(), learnerId, dto.getStartTime(), dto.getEndTime())) {
            throw new ConflictException("A conflicting session already exists for either you or the mentor during this timeframe");
        }

        Availability slot = null;
        if (dto.getAvailabilityId() != null) {
            slot = availabilityRepository.findById(dto.getAvailabilityId())
                    .orElseThrow(() -> new ResourceNotFoundException("Availability slot not found"));

            // Concurrency check: Ensure slot is not already booked
            if (Boolean.TRUE.equals(slot.getIsBooked())) {
                throw new ConflictException("This availability slot has already been booked by another student");
            }
            slot.setIsBooked(true);
            availabilityRepository.save(slot);
        }

        SkillSession session = new SkillSession(
                mentor, learner, dto.getSkillName().trim(), dto.getStartTime(), dto.getEndTime()
        );
        session.setAvailability(slot);
        session.setNotes(dto.getNotes() != null ? dto.getNotes().trim() : "");
        session.setStatus(SessionStatus.REQUESTED);

        SkillSession savedSession = sessionRepository.save(session);
        SessionDto sessionDto = toDto(savedSession);

        // Notify mentor in real time
        try {
            messagingTemplate.convertAndSendToUser(
                    mentor.getEmail(),
                    "/queue/notifications",
                    Map.of(
                            "type", "NEW_SESSION_REQUEST",
                            "session", sessionDto,
                            "message", learner.getFullName() + " requested a learning session for " + dto.getSkillName()
                    )
            );
        } catch (Exception e) {
            // Ignore socket delivery exceptions
        }

        return sessionDto;
    }

    @Transactional(readOnly = true)
    public List<SessionDto> getMySessions(Long userId) {
        return sessionRepository.findAllByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SessionDto acceptSession(Long sessionId, Long currentUserId) {
        SkillSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getMentor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the mentor can accept this session booking request");
        }

        if (session.getStatus() != SessionStatus.REQUESTED) {
            throw new BadRequestException("Cannot accept session with status " + session.getStatus());
        }

        session.setStatus(SessionStatus.CONFIRMED);
        session.setMeetingLink("https://meet.skillswap.edu/room-" + session.getId());

        SkillSession saved = sessionRepository.save(session);
        SessionDto dto = toDto(saved);

        // Notify learner in real time
        try {
            messagingTemplate.convertAndSendToUser(
                    session.getLearner().getEmail(),
                    "/queue/notifications",
                    Map.of(
                            "type", "SESSION_ACCEPTED",
                            "session", dto,
                            "message", session.getMentor().getFullName() + " accepted your session request!"
                    )
            );
        } catch (Exception e) {
            // Ignore socket exceptions
        }

        return dto;
    }

    @Transactional
    public SessionDto rejectSession(Long sessionId, Long currentUserId) {
        SkillSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getMentor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the mentor can reject this session booking request");
        }

        session.setStatus(SessionStatus.REJECTED);
        // Free up slot if linked
        if (session.getAvailability() != null) {
            session.getAvailability().setIsBooked(false);
            availabilityRepository.save(session.getAvailability());
        }

        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public SessionDto cancelSession(Long sessionId, Long currentUserId) {
        SkillSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getLearner().getId().equals(currentUserId) && !session.getMentor().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not a participant in this session");
        }

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a session that is already completed");
        }

        session.setStatus(SessionStatus.CANCELLED);
        if (session.getAvailability() != null) {
            session.getAvailability().setIsBooked(false);
            availabilityRepository.save(session.getAvailability());
        }

        return toDto(sessionRepository.save(session));
    }

    @Transactional
    public SessionDto completeSession(Long sessionId, Long currentUserId) {
        SkillSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getMentor().getId().equals(currentUserId) && !session.getLearner().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only a session participant can mark the session as completed");
        }

        if (session.getStatus() != SessionStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed sessions can be marked as completed");
        }

        session.setStatus(SessionStatus.COMPLETED);
        SkillSession saved = sessionRepository.save(session);

        // Award +50 SwapPoints to mentor for teaching
        User mentor = session.getMentor();
        mentor.setSwapPoints(mentor.getSwapPoints() + 50);
        userRepository.save(mentor);

        SwapPointsTransaction mentorReward = new SwapPointsTransaction(
                mentor, 50, "SESSION_HOSTED", "Mentoring session completed: " + session.getSkillName()
        );
        pointsTransactionRepository.save(mentorReward);

        // Award +20 SwapPoints to learner for completing learning session
        User learner = session.getLearner();
        learner.setSwapPoints(learner.getSwapPoints() + 20);
        userRepository.save(learner);

        SwapPointsTransaction learnerReward = new SwapPointsTransaction(
                learner, 20, "SESSION_ATTENDED", "Learning session attended: " + session.getSkillName()
        );
        pointsTransactionRepository.save(learnerReward);

        return toDto(saved);
    }

    @Transactional
    public SessionFeedbackDto submitFeedback(Long authorId, FeedbackCreateDto dto) {
        SkillSession session = sessionRepository.findById(dto.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + dto.getSessionId()));

        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw new BadRequestException("Feedback can only be provided for completed sessions");
        }

        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        if (!session.getMentor().getId().equals(authorId) && !session.getLearner().getId().equals(authorId)) {
            throw new UnauthorizedException("You are not a participant in this session");
        }

        SessionFeedback feedback = new SessionFeedback(
                session, author, recipient, dto.getRating(), dto.getComment()
        );
        SessionFeedback saved = feedbackRepository.save(feedback);

        return new SessionFeedbackDto(
                saved.getId(),
                session.getId(),
                author.getId(),
                author.getFullName(),
                author.getAvatarUrl(),
                recipient.getId(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    private SessionDto toDto(SkillSession s) {
        SessionDto dto = new SessionDto();
        dto.setId(s.getId());
        dto.setMentorId(s.getMentor().getId());
        dto.setMentorName(s.getMentor().getFullName());
        dto.setMentorEmail(s.getMentor().getEmail());
        dto.setMentorAvatar(s.getMentor().getAvatarUrl());
        dto.setLearnerId(s.getLearner().getId());
        dto.setLearnerName(s.getLearner().getFullName());
        dto.setLearnerEmail(s.getLearner().getEmail());
        dto.setLearnerAvatar(s.getLearner().getAvatarUrl());
        if (s.getAvailability() != null) {
            dto.setAvailabilityId(s.getAvailability().getId());
        }
        dto.setSkillName(s.getSkillName());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setStatus(s.getStatus());
        dto.setNotes(s.getNotes());
        dto.setMeetingLink(s.getMeetingLink());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }
}
