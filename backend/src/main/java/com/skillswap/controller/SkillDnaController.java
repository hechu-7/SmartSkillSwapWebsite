package com.skillswap.controller;

import com.skillswap.dto.SkillDnaDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.SkillDnaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skill-dna")
public class SkillDnaController {

    private final SkillDnaService skillDnaService;

    public SkillDnaController(SkillDnaService skillDnaService) {
        this.skillDnaService = skillDnaService;
    }

    @GetMapping("/my")
    public ResponseEntity<SkillDnaDto> getMySkillDna(@AuthenticationPrincipal UserPrincipal principal) {
        SkillDnaDto dna = skillDnaService.getSkillDna(principal.getId());
        return ResponseEntity.ok(dna);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<SkillDnaDto> getUserSkillDna(@PathVariable Long userId) {
        SkillDnaDto dna = skillDnaService.getSkillDna(userId);
        return ResponseEntity.ok(dna);
    }
}
