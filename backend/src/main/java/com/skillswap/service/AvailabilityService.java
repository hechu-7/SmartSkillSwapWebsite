package com.skillswap.service;

import com.skillswap.dto.AvailabilityCreateDto;
import com.skillswap.dto.AvailabilityDto;
import com.skillswap.entity.Availability;
import com.skillswap.entity.User;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ConflictException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.exception.UnauthorizedException;
import com.skillswap.repository.AvailabilityRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public AvailabilityService(AvailabilityRepository availabilityRepository, UserRepository userRepository) {
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AvailabilityDto createSlot(Long userId, AvailabilityCreateDto dto) {
        if (!dto.getStartTime().isBefore(dto.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        if (dto.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot create an availability slot in the past");
        }

        if (availabilityRepository.existsOverlappingSlot(userId, dto.getStartTime(), dto.getEndTime())) {
            throw new ConflictException("You already have an active availability slot during this time period");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Availability availability = new Availability(user, dto.getTitle().trim(), dto.getStartTime(), dto.getEndTime());
        Availability saved = availabilityRepository.save(availability);

        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AvailabilityDto> getAvailableUpcomingSlots(Long currentUserId) {
        LocalDateTime now = LocalDateTime.now();
        List<Availability> slots;
        if (currentUserId != null) {
            slots = availabilityRepository.findAvailableUpcomingExcludingUser(now, currentUserId);
        } else {
            slots = availabilityRepository.findAllAvailableUpcoming(now);
        }
        return slots.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvailabilityDto> getUserSlots(Long userId) {
        return availabilityRepository.findByUserIdOrderByStartTimeAsc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSlot(Long slotId, Long currentUserId) {
        Availability slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability slot not found with id: " + slotId));

        if (!slot.getUser().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You are not authorized to delete another user's availability slot");
        }

        if (Boolean.TRUE.equals(slot.getIsBooked())) {
            throw new BadRequestException("Cannot delete a slot that has already been booked");
        }

        availabilityRepository.delete(slot);
    }

    private AvailabilityDto toDto(Availability a) {
        AvailabilityDto dto = new AvailabilityDto();
        dto.setId(a.getId());
        dto.setUserId(a.getUser().getId());
        dto.setUserName(a.getUser().getFullName());
        dto.setUserEmail(a.getUser().getEmail());
        dto.setUserAvatar(a.getUser().getAvatarUrl());
        dto.setTitle(a.getTitle());
        dto.setStartTime(a.getStartTime());
        dto.setEndTime(a.getEndTime());
        dto.setIsBooked(a.getIsBooked());
        return dto;
    }
}
