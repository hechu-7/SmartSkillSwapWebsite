package com.skillswap.service;

import com.skillswap.dto.SkillDto;
import com.skillswap.dto.UserProfileUpdateDto;
import com.skillswap.dto.UserSummaryDto;
import com.skillswap.entity.SkillType;
import com.skillswap.entity.User;
import com.skillswap.entity.UserSkill;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.SessionFeedbackRepository;
import com.skillswap.repository.SkillSessionRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SessionFeedbackRepository feedbackRepository;
    private final SkillSessionRepository sessionRepository;

    public UserService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            SessionFeedbackRepository feedbackRepository,
            SkillSessionRepository sessionRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.feedbackRepository = feedbackRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDto> discoverUsers(Long currentUserId, String query, String category) {
        List<User> users;
        if (StringUtils.hasText(query)) {
            users = userRepository.searchUsersExcludingSelf(currentUserId, query.trim());
        } else {
            users = userRepository.findAllExcludingSelf(currentUserId);
        }

        // Get current user's skills for calculating compatibility score
        List<UserSkill> mySkills = userSkillRepository.findByUserId(currentUserId);
        Set<String> myTeachSkills = mySkills.stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .map(s -> s.getSkillName().toLowerCase())
                .collect(Collectors.toSet());
        Set<String> myLearnSkills = mySkills.stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .map(s -> s.getSkillName().toLowerCase())
                .collect(Collectors.toSet());

        return users.stream()
                .map(targetUser -> toUserSummary(targetUser, myTeachSkills, myLearnSkills))
                .filter(summary -> {
                    if (!StringUtils.hasText(category) || "All".equalsIgnoreCase(category)) {
                        return true;
                    }
                    boolean matchesTeach = summary.getTeachSkills().stream()
                            .anyMatch(s -> category.equalsIgnoreCase(s.getCategory()));
                    boolean matchesLearn = summary.getLearnSkills().stream()
                            .anyMatch(s -> category.equalsIgnoreCase(s.getCategory()));
                    return matchesTeach || matchesLearn;
                })
                .sorted(Comparator.comparing(UserSummaryDto::getCompatibilityScore).reversed())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUserProfile(Long userId, Long currentUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<UserSkill> mySkills = currentUserId != null ? userSkillRepository.findByUserId(currentUserId) : Collections.emptyList();
        Set<String> myTeachSkills = mySkills.stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .map(s -> s.getSkillName().toLowerCase())
                .collect(Collectors.toSet());
        Set<String> myLearnSkills = mySkills.stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .map(s -> s.getSkillName().toLowerCase())
                .collect(Collectors.toSet());

        return toUserSummary(user, myTeachSkills, myLearnSkills);
    }

    @Transactional
    public UserSummaryDto updateProfile(Long userId, UserProfileUpdateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (StringUtils.hasText(dto.getFullName())) {
            user.setFullName(dto.getFullName().trim());
        }
        if (dto.getBio() != null) {
            user.setBio(dto.getBio().trim());
        }
        if (StringUtils.hasText(dto.getAvatarUrl())) {
            user.setAvatarUrl(dto.getAvatarUrl().trim());
        }
        if (dto.getLearningInterests() != null) {
            user.setLearningInterests(dto.getLearningInterests().trim());
        }

        // If skills list is provided in update, replace them
        if (dto.getSkills() != null) {
            user.getSkills().clear();
            for (SkillDto sd : dto.getSkills()) {
                UserSkill skill = new UserSkill(
                        user,
                        sd.getSkillName().trim(),
                        sd.getType(),
                        sd.getLevel(),
                        sd.getCategory() != null ? sd.getCategory().trim() : "General"
                );
                if (sd.getYearsExperience() != null) {
                    skill.setYearsExperience(sd.getYearsExperience());
                }
                user.getSkills().add(skill);
            }
        }

        User updatedUser = userRepository.save(user);
        return toUserSummary(updatedUser, Collections.emptySet(), Collections.emptySet());
    }

    private UserSummaryDto toUserSummary(User user, Set<String> myTeachSkills, Set<String> myLearnSkills) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setRole(user.getRole().name());
        dto.setSwapPoints(user.getSwapPoints());
        dto.setSubscriptionPlan(user.getSubscriptionPlan());
        dto.setLearningInterests(user.getLearningInterests());

        List<UserSkill> skills = user.getSkills() != null ? user.getSkills() : Collections.emptyList();

        List<SkillDto> teachSkills = skills.stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                .collect(Collectors.toList());

        List<SkillDto> learnSkills = skills.stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                .collect(Collectors.toList());

        dto.setTeachSkills(teachSkills);
        dto.setLearnSkills(learnSkills);

        // Compute compatibility score (0 - 100%)
        int matches = 0;
        for (SkillDto targetTeach : teachSkills) {
            if (myLearnSkills.contains(targetTeach.getSkillName().toLowerCase())) {
                matches += 2; // High value match: they teach what I want to learn
            }
        }
        for (SkillDto targetLearn : learnSkills) {
            if (myTeachSkills.contains(targetLearn.getSkillName().toLowerCase())) {
                matches += 2; // High value match: I teach what they want to learn
            }
        }

        int compatibility;
        if (matches > 0) {
            compatibility = Math.min(99, 60 + (matches * 10));
        } else if (!teachSkills.isEmpty() && !learnSkills.isEmpty()) {
            compatibility = 65; // Baseline mutual potential
        } else {
            compatibility = 50;
        }
        dto.setCompatibilityScore(compatibility);

        Double avgRating = feedbackRepository.getAverageRatingForUser(user.getId());
        dto.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0);

        long completedSessions = sessionRepository.findAllByUserId(user.getId()).stream()
                .filter(s -> s.getStatus().name().equals("COMPLETED"))
                .count();
        dto.setCompletedSessionsCount(completedSessions);

        return dto;
    }
}
