package com.skillswap.controller;

import com.skillswap.dto.ConversationDto;
import com.skillswap.dto.MessageDto;
import com.skillswap.dto.MessageSendDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MessageSendDto dto) {
        MessageDto sent = messageService.sendMessage(principal.getId(), dto);
        return new ResponseEntity<>(sent, HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MessageDto>> getConversation(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<MessageDto> messages = messageService.getConversation(principal.getId(), userId);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDto>> getConversations(@AuthenticationPrincipal UserPrincipal principal) {
        List<ConversationDto> conversations = messageService.getConversations(principal.getId());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Long> unread = messageService.getUnreadCount(principal.getId());
        return ResponseEntity.ok(unread);
    }

    @PatchMapping("/{partnerId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long partnerId,
            @AuthenticationPrincipal UserPrincipal principal) {
        messageService.markAsRead(principal.getId(), partnerId);
        return ResponseEntity.ok().build();
    }
}
