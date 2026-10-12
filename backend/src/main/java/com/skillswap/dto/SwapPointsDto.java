package com.skillswap.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SwapPointsDto {

    private Integer currentBalance;
    private List<TransactionDto> history;

    public static class TransactionDto {
        private Long id;
        private Integer amount;
        private String type;
        private String description;
        private LocalDateTime createdAt;

        public TransactionDto() {}

        public TransactionDto(Long id, Integer amount, String type, String description, LocalDateTime createdAt) {
            this.id = id;
            this.amount = amount;
            this.type = type;
            this.description = description;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Integer getAmount() { return amount; }
        public void setAmount(Integer amount) { this.amount = amount; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public SwapPointsDto() {
    }

    public SwapPointsDto(Integer currentBalance, List<TransactionDto> history) {
        this.currentBalance = currentBalance;
        this.history = history;
    }

    public Integer getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(Integer currentBalance) {
        this.currentBalance = currentBalance;
    }

    public List<TransactionDto> getHistory() {
        return history;
    }

    public void setHistory(List<TransactionDto> history) {
        this.history = history;
    }
}
