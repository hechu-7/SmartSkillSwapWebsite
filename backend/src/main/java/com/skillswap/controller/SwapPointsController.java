package com.skillswap.controller;

import com.skillswap.dto.SwapPointsDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.SwapPointsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/points")
public class SwapPointsController {

    private final SwapPointsService swapPointsService;

    public SwapPointsController(SwapPointsService swapPointsService) {
        this.swapPointsService = swapPointsService;
    }

    @GetMapping("/my")
    public ResponseEntity<SwapPointsDto> getMyPoints(@AuthenticationPrincipal UserPrincipal principal) {
        SwapPointsDto summary = swapPointsService.getPointsSummary(principal.getId());
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/claim-daily")
    public ResponseEntity<SwapPointsDto> claimDailyBonus(@AuthenticationPrincipal UserPrincipal principal) {
        SwapPointsDto summary = swapPointsService.claimDailyBonus(principal.getId());
        return ResponseEntity.ok(summary);
    }
}
