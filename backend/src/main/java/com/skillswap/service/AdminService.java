package com.skillswap.service;

import com.skillswap.dto.AdminStatsDto;
import com.skillswap.dto.UserSummaryDto;
import com.skillswap.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final SkillSessionRepository sessionRepository;
    private final SkillRequestRepository requestRepository;
    private final MessageRepository messageRepository;
    private final AvailabilityRepository availabilityRepository;
    private final UserService userService;

    public AdminService(
            UserRepository userRepository,
            SkillSessionRepository sessionRepository,
            SkillRequestRepository requestRepository,
            MessageRepository messageRepository,
            AvailabilityRepository availabilityRepository,
            UserService userService) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.requestRepository = requestRepository;
        this.messageRepository = messageRepository;
        this.availabilityRepository = availabilityRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getSystemStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalSessions(sessionRepository.count());
        stats.setTotalRequests(requestRepository.count());
        stats.setTotalMessages(messageRepository.count());
        stats.setActiveAvailabilities(availabilityRepository.findAllAvailableUpcoming(LocalDateTime.now()).size() + 0L);

        List<UserSummaryDto> recentUsers = userService.discoverUsers(0L, null, null);
        stats.setRecentUsers(recentUsers.stream().limit(10).toList());

        return stats;
    }
}
