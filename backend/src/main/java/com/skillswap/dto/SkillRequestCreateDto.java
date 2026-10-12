package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SkillRequestCreateDto {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotBlank(message = "Requested skill is required")
    private String requestedSkill;

    @NotBlank(message = "Offered skill is required")
    private String offeredSkill;

    private String message;

    public SkillRequestCreateDto() {
    }

    public SkillRequestCreateDto(Long recipientId, String requestedSkill, String offeredSkill, String message) {
        this.recipientId = recipientId;
        this.requestedSkill = requestedSkill;
        this.offeredSkill = offeredSkill;
        this.message = message;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRequestedSkill() {
        return requestedSkill;
    }

    public void setRequestedSkill(String requestedSkill) {
        this.requestedSkill = requestedSkill;
    }

    public String getOfferedSkill() {
        return offeredSkill;
    }

    public void setOfferedSkill(String offeredSkill) {
        this.offeredSkill = offeredSkill;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
