package com.skillswap.service;

import com.skillswap.dto.SkillDnaDto;
import com.skillswap.dto.SkillDto;
import com.skillswap.entity.SkillLevel;
import com.skillswap.entity.SkillType;
import com.skillswap.entity.User;
import com.skillswap.entity.UserSkill;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.UserRepository;
import com.skillswap.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillDnaService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public SkillDnaService(UserRepository userRepository, UserSkillRepository userSkillRepository) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
    }

    @Transactional(readOnly = true)
    public SkillDnaDto getSkillDna(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<UserSkill> skills = userSkillRepository.findByUserId(userId);

        List<SkillDto> teachingSkills = skills.stream()
                .filter(s -> s.getType() == SkillType.TEACH)
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                .collect(Collectors.toList());

        List<SkillDto> learningSkills = skills.stream()
                .filter(s -> s.getType() == SkillType.LEARN)
                .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                .collect(Collectors.toList());

        // Category breakdown calculation
        Map<String, Integer> categoryDistribution = new HashMap<>();
        if (!skills.isEmpty()) {
            Map<String, Long> rawCounts = skills.stream()
                    .collect(Collectors.groupingBy(s -> s.getCategory() != null ? s.getCategory() : "General", Collectors.counting()));
            int total = skills.size();
            for (Map.Entry<String, Long> entry : rawCounts.entrySet()) {
                int percent = (int) Math.round((entry.getValue() * 100.0) / total);
                categoryDistribution.put(entry.getKey(), percent);
            }
        } else {
            categoryDistribution.put("General", 100);
        }

        // Identified Strengths (Expert & Advanced skills)
        List<String> strengths = new ArrayList<>();
        for (SkillDto td : teachingSkills) {
            if (td.getLevel() == SkillLevel.EXPERT || td.getLevel() == SkillLevel.ADVANCED) {
                strengths.add(td.getSkillName() + " (" + td.getLevel() + " - " + td.getCategory() + ")");
            }
        }
        if (strengths.isEmpty() && !teachingSkills.isEmpty()) {
            strengths.add(teachingSkills.get(0).getSkillName() + " (" + teachingSkills.get(0).getLevel() + ")");
        } else if (strengths.isEmpty()) {
            strengths.add("Ready to share foundational knowledge - add teaching skills to boost DNA");
        }

        // Growth Recommendations
        List<String> recommendations = new ArrayList<>();
        for (SkillDto ld : learningSkills) {
            recommendations.add("Deepen practice in " + ld.getSkillName() + " by booking weekly exchange sessions");
        }
        if (recommendations.isEmpty()) {
            recommendations.add("Define learning goals in your profile to expand your skill horizons");
        }

        // Suggested skills to learn next (Curated based on current teach/learn profile)
        List<String> suggestedNext = new ArrayList<>();
        Set<String> currentSkillNames = skills.stream()
                .map(s -> s.getSkillName().toLowerCase())
                .collect(Collectors.toSet());

        List<String> curatedCatalog = List.of(
                "Full-Stack React & Vite", "System Design & Microservices",
                "TiDB Distributed SQL", "Cloud DevOps & Docker",
                "UI/UX Design in Figma", "Data Structures & Algorithms",
                "Machine Learning Fundamentals", "Public Speaking & Pitching"
        );

        for (String cat : curatedCatalog) {
            if (!currentSkillNames.contains(cat.toLowerCase())) {
                suggestedNext.add(cat);
                if (suggestedNext.size() >= 4) break;
            }
        }

        // Overall versatility score
        int versatility = Math.min(100, (teachingSkills.size() * 15) + (learningSkills.size() * 10) + (categoryDistribution.size() * 10));
        if (versatility < 30) versatility = 45;

        SkillDnaDto dna = new SkillDnaDto();
        dna.setUserId(user.getId());
        dna.setFullName(user.getFullName());
        dna.setTeachingSkills(teachingSkills);
        dna.setLearningSkills(learningSkills);
        dna.setCategoryDistribution(categoryDistribution);
        dna.setIdentifiedStrengths(strengths);
        dna.setGrowthRecommendations(recommendations);
        dna.setSuggestedSkillsToLearnNext(suggestedNext);
        dna.setOverallSkillVersatilityScore(versatility);

        return dna;
    }
}
