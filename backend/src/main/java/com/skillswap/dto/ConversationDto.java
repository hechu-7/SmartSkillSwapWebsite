package com.skillswap.dto;

import java.time.LocalDateTime;

public class ConversationDto {

    private Long partnerId;
    private String partnerName;
    private String partnerEmail;
    private String partnerAvatar;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;

    public ConversationDto() {
    }

    public ConversationDto(Long partnerId, String partnerName, String partnerEmail, String partnerAvatar, String lastMessage, LocalDateTime lastMessageTime, Long unreadCount) {
        this.partnerId = partnerId;
        this.partnerName = partnerName;
        this.partnerEmail = partnerEmail;
        this.partnerAvatar = partnerAvatar;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
    }

    public Long getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(Long partnerId) {
        this.partnerId = partnerId;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public String getPartnerEmail() {
        return partnerEmail;
    }

    public void setPartnerEmail(String partnerEmail) {
        this.partnerEmail = partnerEmail;
    }

    public String getPartnerAvatar() {
        return partnerAvatar;
    }

    public void setPartnerAvatar(String partnerAvatar) {
        this.partnerAvatar = partnerAvatar;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(LocalDateTime lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public Long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(Long unreadCount) {
        this.unreadCount = unreadCount;
    }
}
