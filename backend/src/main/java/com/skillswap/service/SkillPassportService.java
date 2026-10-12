package com.skillswap.service;

import com.skillswap.dto.SessionFeedbackDto;
import com.skillswap.dto.SkillDto;
import com.skillswap.dto.SkillPassportDto;
import com.skillswap.entity.SessionStatus;
import com.skillswap.entity.SkillType;
import com.skillswap.entity.User;
import com.skillswap.entity.UserSkill;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.SessionFeedbackRepository;
import com.skillswap.repository.SkillSessionRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillPassportService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillSessionRepository sessionRepository;
    private final SessionFeedbackRepository feedbackRepository;

    public SkillPassportService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            SkillSessionRepository sessionRepository,
            SessionFeedbackRepository feedbackRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.sessionRepository = sessionRepository;
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional(readOnly = true)
    public SkillPassportDto getSkillPassport(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<UserSkill> skills = userSkillRepository.findByUserId(userId);

        List<SkillDto> taught = skills.stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                .collect(Collectors.toList());

        List<SkillDto> learned = skills.stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                .collect(Collectors.toList());

        long completedSessions = sessionRepository.findAllByUserId(userId).stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED)
                .count();

        Double avgRating = feedbackRepository.getAverageRatingForUser(userId);
        double roundedRating = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0;

        List<SessionFeedbackDto> feedbacks = feedbackRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(f -> new SessionFeedbackDto(
                        f.getId(),
                        f.getSession().getId(),
                        f.getAuthor().getId(),
                        f.getAuthor().getFullName(),
                        f.getAuthor().getAvatarUrl(),
                        f.getRecipient().getId(),
                        f.getRating(),
                        f.getComment(),
                        f.getCreatedAt()
                ))
                .collect(Collectors.toList());

        // Dynamic Achievement calculations
        List<SkillPassportDto.AchievementDto> achievements = new ArrayList<>();
        achievements.add(new SkillPassportDto.AchievementDto(
                "ACH-01", "Genesis Pioneer", "Joined the SkillSwap peer learning ecosystem", "Award", true,
                user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM yyyy"))
        ));

        achievements.add(new SkillPassportDto.AchievementDto(
                "ACH-02", "First Knowledge Handshake", "Completed initial peer skill-exchange session", "Sparkles",
                completedSessions >= 1, completedSessions >= 1 ? "Verified on TiDB" : "Locked"
        ));

        achievements.add(new SkillPassportDto.AchievementDto(
                "ACH-03", "5-Star Acclaimed Mentor", "Received top-tier feedback from fellow students", "Star",
                roundedRating >= 4.8 && !feedbacks.isEmpty(), !feedbacks.isEmpty() ? "Verified" : "Locked"
        ));

        achievements.add(new SkillPassportDto.AchievementDto(
                "ACH-04", "Polymath Explorer", "Active learning in 3 or more distinct disciplines", "Compass",
                learned.size() >= 3, learned.size() >= 3 ? "Active" : "Locked"
        ));

        SkillPassportDto passport = new SkillPassportDto();
        passport.setUserId(user.getId());
        passport.setFullName(user.getFullName());
        passport.setEmail(user.getEmail());
        passport.setAvatarUrl(user.getAvatarUrl());
        passport.setMemberSince(user.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM yyyy")));
        passport.setPassportVerificationCode("TIDB-SKILLSWAP-VERIFIED-" + user.getId() + "-" + Integer.toHexString(user.getEmail().hashCode()).toUpperCase());
        passport.setSkillsTaught(taught);
        passport.setSkillsLearned(learned);
        passport.setCompletedSessionsCount(completedSessions);
        passport.setAverageRating(roundedRating);
        passport.setFeedbacks(feedbacks);
        passport.setAchievements(achievements);

        return passport;
    }
}
