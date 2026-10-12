package com.skillswap.service;

import com.skillswap.dto.ConversationDto;
import com.skillswap.dto.MessageDto;
import com.skillswap.dto.MessageSendDto;
import com.skillswap.entity.Message;
import com.skillswap.entity.User;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.MessageRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageDto sendMessage(Long senderId, MessageSendDto dto) {
        if (!StringUtils.hasText(dto.getContent())) {
            throw new BadRequestException("Message content cannot be blank");
        }

        if (dto.getContent().length() > 4000) {
            throw new BadRequestException("Message content exceeds 4000 characters limit");
        }

        if (senderId.equals(dto.getRecipientId())) {
            throw new BadRequestException("You cannot send a message to yourself");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found with id: " + dto.getRecipientId()));

        // 1. Save to TiDB first
        Message message = new Message(sender, recipient, dto.getContent().trim());
        Message savedMessage = messageRepository.save(message);

        MessageDto messageDto = toDto(savedMessage);

        // 2. Deliver to recipient securely via private STOMP queue
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/messages",
                    messageDto
            );
        } catch (Exception e) {
            // Log and allow HTTP response to succeed
        }

        return messageDto;
    }

    @Transactional
    public List<MessageDto> getConversation(Long currentUserId, Long partnerId) {
        // Validate partner exists
        if (!userRepository.existsById(partnerId)) {
            throw new ResourceNotFoundException("Partner not found with id: " + partnerId);
        }

        // Mark incoming unread messages from this partner as read
        messageRepository.markConversationAsRead(currentUserId, partnerId);

        List<Message> messages = messageRepository.findConversationBetween(currentUserId, partnerId);
        return messages.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations(Long currentUserId) {
        List<Long> partnerIds = messageRepository.findDistinctConversationPartnerIds(currentUserId);
        List<ConversationDto> conversationDtos = new ArrayList<>();

        for (Long partnerId : partnerIds) {
            userRepository.findById(partnerId).ifPresent(partner -> {
                List<Message> history = messageRepository.findConversationBetween(currentUserId, partnerId);
                if (!history.isEmpty()) {
                    Message lastMsg = history.get(history.size() - 1);
                    long unreadCount = messageRepository.countUnreadMessagesFromSender(currentUserId, partnerId);

                    conversationDtos.add(new ConversationDto(
                            partner.getId(),
                            partner.getFullName(),
                            partner.getEmail(),
                            partner.getAvatarUrl(),
                            lastMsg.getContent(),
                            lastMsg.getCreatedAt(),
                            unreadCount
                    ));
                }
            });
        }

        // Sort by most recent message
        conversationDtos.sort(Comparator.comparing(ConversationDto::getLastMessageTime).reversed());
        return conversationDtos;
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getUnreadCount(Long currentUserId) {
        long count = messageRepository.countUnreadMessagesForUser(currentUserId);
        return Map.of("unreadCount", count);
    }

    @Transactional
    public void markAsRead(Long currentUserId, Long partnerId) {
        messageRepository.markConversationAsRead(currentUserId, partnerId);
    }

    private MessageDto toDto(Message m) {
        return new MessageDto(
                m.getId(),
                m.getSender().getId(),
                m.getSender().getFullName(),
                m.getSender().getAvatarUrl(),
                m.getRecipient().getId(),
                m.getRecipient().getFullName(),
                m.getContent(),
                m.getIsRead(),
                m.getCreatedAt()
        );
    }
}
