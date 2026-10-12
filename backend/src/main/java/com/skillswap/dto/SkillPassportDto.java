package com.skillswap.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SkillPassportDto {

    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private String memberSince;
    private String passportVerificationCode;
    private List<SkillDto> skillsTaught;
    private List<SkillDto> skillsLearned;
    private Long completedSessionsCount;
    private Double averageRating;
    private List<SessionFeedbackDto> feedbacks;
    private List<AchievementDto> achievements;

    public static class AchievementDto {
        private String id;
        private String title;
        private String description;
        private String icon;
        private boolean unlocked;
        private String unlockedDate;

        public AchievementDto() {}

        public AchievementDto(String id, String title, String description, String icon, boolean unlocked, String unlockedDate) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.icon = icon;
            this.unlocked = unlocked;
            this.unlockedDate = unlockedDate;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public boolean isUnlocked() { return unlocked; }
        public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }
        public String getUnlockedDate() { return unlockedDate; }
        public void setUnlockedDate(String unlockedDate) { this.unlockedDate = unlockedDate; }
    }

    public SkillPassportDto() {
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(String memberSince) {
        this.memberSince = memberSince;
    }

    public String getPassportVerificationCode() {
        return passportVerificationCode;
    }

    public void setPassportVerificationCode(String passportVerificationCode) {
        this.passportVerificationCode = passportVerificationCode;
    }

    public List<SkillDto> getSkillsTaught() {
        return skillsTaught;
    }

    public void setSkillsTaught(List<SkillDto> skillsTaught) {
        this.skillsTaught = skillsTaught;
    }

    public List<SkillDto> getSkillsLearned() {
        return skillsLearned;
    }

    public void setSkillsLearned(List<SkillDto> skillsLearned) {
        this.skillsLearned = skillsLearned;
    }

    public Long getCompletedSessionsCount() {
        return completedSessionsCount;
    }

    public void setCompletedSessionsCount(Long completedSessionsCount) {
        this.completedSessionsCount = completedSessionsCount;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public List<SessionFeedbackDto> getFeedbacks() {
        return feedbacks;
    }

    public void setFeedbacks(List<SessionFeedbackDto> feedbacks) {
        this.feedbacks = feedbacks;
    }

    public List<AchievementDto> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<AchievementDto> achievements) {
        this.achievements = achievements;
    }
}
