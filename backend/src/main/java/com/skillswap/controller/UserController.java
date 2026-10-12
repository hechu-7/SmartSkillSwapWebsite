package com.skillswap.controller;

import com.skillswap.dto.UserProfileUpdateDto;
import com.skillswap.dto.UserSummaryDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/discover")
    public ResponseEntity<List<UserSummaryDto>> discoverUsers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category) {
        List<UserSummaryDto> users = userService.discoverUsers(principal.getId(), query, category);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryDto> getUserProfile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserSummaryDto user = userService.getUserProfile(id, principal != null ? principal.getId() : null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserSummaryDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UserProfileUpdateDto dto) {
        UserSummaryDto updated = userService.updateProfile(principal.getId(), dto);
        return ResponseEntity.ok(updated);
    }
}
