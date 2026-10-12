package com.skillswap.dto;

import java.util.List;
import java.util.Map;

public class SkillDnaDto {

    private Long userId;
    private String fullName;
    private List<SkillDto> teachingSkills;
    private List<SkillDto> learningSkills;
    private Map<String, Integer> categoryDistribution; // e.g. "Programming": 40%, "Design": 30%
    private List<String> identifiedStrengths;
    private List<String> growthRecommendations;
    private List<String> suggestedSkillsToLearnNext;
    private Integer overallSkillVersatilityScore; // 0-100 calculated metric

    public SkillDnaDto() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public List<SkillDto> getTeachingSkills() {
        return teachingSkills;
    }

    public void setTeachingSkills(List<SkillDto> teachingSkills) {
        this.teachingSkills = teachingSkills;
    }

    public List<SkillDto> getLearningSkills() {
        return learningSkills;
    }

    public void setLearningSkills(List<SkillDto> learningSkills) {
        this.learningSkills = learningSkills;
    }

    public Map<String, Integer> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Integer> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public List<String> getIdentifiedStrengths() {
        return identifiedStrengths;
    }

    public void setIdentifiedStrengths(List<String> identifiedStrengths) {
        this.identifiedStrengths = identifiedStrengths;
    }

    public List<String> getGrowthRecommendations() {
        return growthRecommendations;
    }

    public void setGrowthRecommendations(List<String> growthRecommendations) {
        this.growthRecommendations = growthRecommendations;
    }

    public List<String> getSuggestedSkillsToLearnNext() {
        return suggestedSkillsToLearnNext;
    }

    public void setSuggestedSkillsToLearnNext(List<String> suggestedSkillsToLearnNext) {
        this.suggestedSkillsToLearnNext = suggestedSkillsToLearnNext;
    }

    public Integer getOverallSkillVersatilityScore() {
        return overallSkillVersatilityScore;
    }

    public void setOverallSkillVersatilityScore(Integer overallSkillVersatilityScore) {
        this.overallSkillVersatilityScore = overallSkillVersatilityScore;
    }
}
