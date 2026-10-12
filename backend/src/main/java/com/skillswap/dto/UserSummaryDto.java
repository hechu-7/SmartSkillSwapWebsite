package com.skillswap.dto;

import java.util.List;

public class UserSummaryDto {

    private Long id;
    private String fullName;
    private String email;
    private String bio;
    private String avatarUrl;
    private String role;
    private Integer swapPoints;
    private String subscriptionPlan;
    private String learningInterests;
    private List<SkillDto> teachSkills;
    private List<SkillDto> learnSkills;
    private Integer compatibilityScore; // 0-100% computed from complementary skills
    private Double averageRating;
    private Long completedSessionsCount;

    public UserSummaryDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getSwapPoints() {
        return swapPoints;
    }

    public void setSwapPoints(Integer swapPoints) {
        this.swapPoints = swapPoints;
    }

    public String getSubscriptionPlan() {
        return subscriptionPlan;
    }

    public void setSubscriptionPlan(String subscriptionPlan) {
        this.subscriptionPlan = subscriptionPlan;
    }

    public String getLearningInterests() {
        return learningInterests;
    }

    public void setLearningInterests(String learningInterests) {
        this.learningInterests = learningInterests;
    }

    public List<SkillDto> getTeachSkills() {
        return teachSkills;
    }

    public void setTeachSkills(List<SkillDto> teachSkills) {
        this.teachSkills = teachSkills;
    }

    public List<SkillDto> getLearnSkills() {
        return learnSkills;
    }

    public void setLearnSkills(List<SkillDto> learnSkills) {
        this.learnSkills = learnSkills;
    }

    public Integer getCompatibilityScore() {
        return compatibilityScore;
    }

    public void setCompatibilityScore(Integer compatibilityScore) {
        this.compatibilityScore = compatibilityScore;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getCompletedSessionsCount() {
        return completedSessionsCount;
    }

    public void setCompletedSessionsCount(Long completedSessionsCount) {
        this.completedSessionsCount = completedSessionsCount;
    }
}
