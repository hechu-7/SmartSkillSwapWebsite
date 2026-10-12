package com.skillswap.dto;

import com.skillswap.entity.SkillLevel;
import com.skillswap.entity.SkillType;

public class SkillDto {

    private Long id;
    private String skillName;
    private SkillType type;
    private SkillLevel level;
    private String category;
    private Integer yearsExperience;

    public SkillDto() {
    }

    public SkillDto(Long id, String skillName, SkillType type, SkillLevel level, String category, Integer yearsExperience) {
        this.id = id;
        this.skillName = skillName;
        this.type = type;
        this.level = level;
        this.category = category;
        this.yearsExperience = yearsExperience;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public SkillType getType() {
        return type;
    }

    public void setType(SkillType type) {
        this.type = type;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public void setLevel(SkillLevel level) {
        this.level = level;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }
}
