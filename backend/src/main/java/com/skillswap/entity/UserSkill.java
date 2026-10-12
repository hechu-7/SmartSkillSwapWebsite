package com.skillswap.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_skills", indexes = {
    @Index(name = "idx_user_skill_name", columnList = "skillName"),
    @Index(name = "idx_user_skill_type", columnList = "type")
})
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String skillName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkillType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkillLevel level = SkillLevel.INTERMEDIATE;

    @Column(length = 50)
    private String category = "General";

    private Integer yearsExperience = 1;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public UserSkill() {
    }

    public UserSkill(User user, String skillName, SkillType type, SkillLevel level, String category) {
        this.user = user;
        this.skillName = skillName;
        this.type = type;
        this.level = level != null ? level : SkillLevel.INTERMEDIATE;
        this.category = category != null ? category : "General";
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.level == null) {
            this.level = SkillLevel.INTERMEDIATE;
        }
        if (this.category == null) {
            this.category = "General";
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
