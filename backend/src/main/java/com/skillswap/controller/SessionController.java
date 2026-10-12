package com.skillswap.controller;

import com.skillswap.dto.FeedbackCreateDto;
import com.skillswap.dto.SessionBookingRequestDto;
import com.skillswap.dto.SessionDto;
import com.skillswap.dto.SessionFeedbackDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<SessionDto> bookSession(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SessionBookingRequestDto dto) {
        SessionDto session = sessionService.bookSession(principal.getId(), dto);
        return new ResponseEntity<>(session, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<SessionDto>> getMySessions(@AuthenticationPrincipal UserPrincipal principal) {
        List<SessionDto> sessions = sessionService.getMySessions(principal.getId());
        return ResponseEntity.ok(sessions);
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<SessionDto> acceptSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SessionDto accepted = sessionService.acceptSession(id, principal.getId());
        return ResponseEntity.ok(accepted);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<SessionDto> rejectSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SessionDto rejected = sessionService.rejectSession(id, principal.getId());
        return ResponseEntity.ok(rejected);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SessionDto> cancelSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SessionDto cancelled = sessionService.cancelSession(id, principal.getId());
        return ResponseEntity.ok(cancelled);
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<SessionDto> completeSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SessionDto completed = sessionService.completeSession(id, principal.getId());
        return ResponseEntity.ok(completed);
    }

    @PostMapping("/feedback")
    public ResponseEntity<SessionFeedbackDto> submitFeedback(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody FeedbackCreateDto dto) {
        SessionFeedbackDto feedback = sessionService.submitFeedback(principal.getId(), dto);
        return new ResponseEntity<>(feedback, HttpStatus.CREATED);
    }
}
