package com.skillswap.dto;

import java.util.List;

public class AdminStatsDto {

    private Long totalUsers;
    private Long totalSessions;
    private Long totalRequests;
    private Long totalMessages;
    private Long activeAvailabilities;
    private List<UserSummaryDto> recentUsers;

    public AdminStatsDto() {
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public Long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(Long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public Long getTotalMessages() {
        return totalMessages;
    }

    public void setTotalMessages(Long totalMessages) {
        this.totalMessages = totalMessages;
    }

    public Long getActiveAvailabilities() {
        return activeAvailabilities;
    }

    public void setActiveAvailabilities(Long activeAvailabilities) {
        this.activeAvailabilities = activeAvailabilities;
    }

    public List<UserSummaryDto> getRecentUsers() {
        return recentUsers;
    }

    public void setRecentUsers(List<UserSummaryDto> recentUsers) {
        this.recentUsers = recentUsers;
    }
}
