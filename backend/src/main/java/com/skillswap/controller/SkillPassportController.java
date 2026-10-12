package com.skillswap.controller;

import com.skillswap.dto.SkillPassportDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.SkillPassportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skill-passport")
public class SkillPassportController {

    private final SkillPassportService skillPassportService;

    public SkillPassportController(SkillPassportService skillPassportService) {
        this.skillPassportService = skillPassportService;
    }

    @GetMapping("/my")
    public ResponseEntity<SkillPassportDto> getMyPassport(@AuthenticationPrincipal UserPrincipal principal) {
        SkillPassportDto passport = skillPassportService.getSkillPassport(principal.getId());
        return ResponseEntity.ok(passport);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<SkillPassportDto> getUserPassport(@PathVariable Long userId) {
        SkillPassportDto passport = skillPassportService.getSkillPassport(userId);
        return ResponseEntity.ok(passport);
    }
}
