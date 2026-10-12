package com.skillswap.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MessageSendDto {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    private String content;

    public MessageSendDto() {
    }

    public MessageSendDto(Long recipientId, String content) {
        this.recipientId = recipientId;
        this.content = content;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
