package com.skillswap.dto;

import java.util.List;

public class UserProfileUpdateDto {

    private String fullName;
    private String bio;
    private String avatarUrl;
    private String learningInterests;
    private List<SkillDto> skills;

    public UserProfileUpdateDto() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getLearningInterests() {
        return learningInterests;
    }

    public void setLearningInterests(String learningInterests) {
        this.learningInterests = learningInterests;
    }

    public List<SkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillDto> skills) {
        this.skills = skills;
    }
}
