package com.skillswap.controller;

import com.skillswap.dto.AvailabilityCreateDto;
import com.skillswap.dto.AvailabilityDto;
import com.skillswap.security.UserPrincipal;
import com.skillswap.service.AvailabilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @PostMapping
    public ResponseEntity<AvailabilityDto> createSlot(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AvailabilityCreateDto dto) {
        AvailabilityDto slot = availabilityService.createSlot(principal.getId(), dto);
        return new ResponseEntity<>(slot, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AvailabilityDto>> getAvailableUpcomingSlots(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AvailabilityDto> slots = availabilityService.getAvailableUpcomingSlots(principal != null ? principal.getId() : null);
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AvailabilityDto>> getMySlots(@AuthenticationPrincipal UserPrincipal principal) {
        List<AvailabilityDto> slots = availabilityService.getUserSlots(principal.getId());
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AvailabilityDto>> getUserSlots(@PathVariable Long userId) {
        List<AvailabilityDto> slots = availabilityService.getUserSlots(userId);
        return ResponseEntity.ok(slots);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        availabilityService.deleteSlot(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
