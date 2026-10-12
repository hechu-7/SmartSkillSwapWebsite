package com.skillswap.controller;

import com.skillswap.dto.SkillRequestCreateDto;
import com.skillswap.dto.SkillRequestDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.SkillRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-requests")
public class SkillRequestController {

    private final SkillRequestService skillRequestService;

    public SkillRequestController(SkillRequestService skillRequestService) {
        this.skillRequestService = skillRequestService;
    }

    @PostMapping
    public ResponseEntity<SkillRequestDto> createRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SkillRequestCreateDto dto) {
        SkillRequestDto created = skillRequestService.createRequest(principal.getId(), dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/received")
    public ResponseEntity<List<SkillRequestDto>> getReceivedRequests(@AuthenticationPrincipal UserPrincipal principal) {
        List<SkillRequestDto> received = skillRequestService.getReceivedRequests(principal.getId());
        return ResponseEntity.ok(received);
    }

    @GetMapping("/sent")
    public ResponseEntity<List<SkillRequestDto>> getSentRequests(@AuthenticationPrincipal UserPrincipal principal) {
        List<SkillRequestDto> sent = skillRequestService.getSentRequests(principal.getId());
        return ResponseEntity.ok(sent);
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<SkillRequestDto> acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SkillRequestDto accepted = skillRequestService.acceptRequest(id, principal.getId());
        return ResponseEntity.ok(accepted);
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<SkillRequestDto> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        SkillRequestDto rejected = skillRequestService.rejectRequest(id, principal.getId());
        return ResponseEntity.ok(rejected);
    }
}
