package com.skillswap.service;

import com.skillswap.dto.SkillRequestCreateDto;
import com.skillswap.dto.SkillRequestDto;
import com.skillswap.entity.RequestStatus;
import com.skillswap.entity.SkillRequest;
import com.skillswap.entity.User;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ConflictException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.repository.SkillRequestRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SkillRequestService {

    private final SkillRequestRepository skillRequestRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public SkillRequestService(
            SkillRequestRepository skillRequestRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.skillRequestRepository = skillRequestRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public SkillRequestDto createRequest(Long senderId, SkillRequestCreateDto dto) {
        if (senderId.equals(dto.getRecipientId())) {
            throw new BadRequestException("You cannot send a skill exchange request to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        if (skillRequestRepository.existsPendingDuplicate(
                senderId, dto.getRecipientId(), dto.getRequestedSkill().trim(), dto.getOfferedSkill().trim())) {
            throw new ConflictException("A pending exchange request for these skills already exists between you and " + recipient.getFullName());
        }

        SkillRequest request = new SkillRequest(
                sender,
                recipient,
                dto.getRequestedSkill().trim(),
                dto.getOfferedSkill().trim(),
                dto.getMessage() != null ? dto.getMessage().trim() : ""
        );

        SkillRequest saved = skillRequestRepository.save(request);
        SkillRequestDto responseDto = toDto(saved);

        // Notify recipient in real time over STOMP
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/notifications",
                    Map.of(
                            "type", "NEW_SKILL_REQUEST",
                            "request", responseDto,
                            "message", sender.getFullName() + " sent you a skill exchange request!"
                    )
            );
        } catch (Exception e) {
            // Log and allow persistence to succeed even if socket notification has a delivery delay
        }

        return responseDto;
    }

    @Transactional(readOnly = true)
    public List<SkillRequestDto> getReceivedRequests(Long recipientId) {
        return skillRequestRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SkillRequestDto> getSentRequests(Long senderId) {
        return skillRequestRepository.findBySenderIdOrderByCreatedAtDesc(senderId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillRequestDto acceptRequest(Long requestId, Long currentUserId) {
        SkillRequest request = skillRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill request not found with id: " + requestId));

        if (!request.getRecipient().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the intended recipient can accept this skill exchange request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Cannot accept a request that is already " + request.getStatus());
        }

        request.setStatus(RequestStatus.ACCEPTED);
        SkillRequest saved = skillRequestRepository.save(request);
        SkillRequestDto responseDto = toDto(saved);

        // Notify sender in real time that their request was accepted
        try {
            messagingTemplate.convertAndSendToUser(
                    request.getSender().getEmail(),
                    "/queue/notifications",
                    Map.of(
                            "type", "SKILL_REQUEST_ACCEPTED",
                            "request", responseDto,
                            "message", request.getRecipient().getFullName() + " accepted your skill exchange request!"
                    )
            );
        } catch (Exception e) {
            // Ignore socket delivery transient issues
        }

        return responseDto;
    }

    @Transactional
    public SkillRequestDto rejectRequest(Long requestId, Long currentUserId) {
        SkillRequest request = skillRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill request not found with id: " + requestId));

        if (!request.getRecipient().getId().equals(currentUserId)) {
            throw new UnauthorizedException("Only the intended recipient can reject this skill exchange request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Cannot reject a request that is already " + request.getStatus());
        }

        request.setStatus(RequestStatus.REJECTED);
        SkillRequest saved = skillRequestRepository.save(request);
        return toDto(saved);
    }

    private SkillRequestDto toDto(SkillRequest r) {
        SkillRequestDto dto = new SkillRequestDto();
        dto.setId(r.getId());
        dto.setSenderId(r.getSender().getId());
        dto.setSenderName(r.getSender().getFullName());
        dto.setSenderEmail(r.getSender().getEmail());
        dto.setSenderAvatar(r.getSender().getAvatarUrl());
        dto.setRecipientId(r.getRecipient().getId());
        dto.setRecipientName(r.getRecipient().getFullName());
        dto.setRecipientEmail(r.getRecipient().getEmail());
        dto.setRequestedSkill(r.getRequestedSkill());
        dto.setOfferedSkill(r.getOfferedSkill());
        dto.setMessage(r.getMessage());
        dto.setStatus(r.getStatus());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}
