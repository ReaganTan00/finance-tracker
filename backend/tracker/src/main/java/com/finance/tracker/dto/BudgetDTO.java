package com.finance.tracker.dto;

import com.finance.tracker.entity.Budget;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Objects for Budget Management
 */
public class BudgetDTO {

    /**
     * Request DTO for creating a budget
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Budget amount is required")
        @Positive(message = "Budget amount must be positive")
        private BigDecimal amount;

        @NotNull(message = "Budget period is required")
        private Budget.BudgetPeriod period;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;
    }

    /**
     * Request DTO for updating a budget
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {

        @Positive(message = "Budget amount must be positive")
        private BigDecimal amount;

        private Budget.BudgetPeriod period;

        private LocalDate startDate;

        private LocalDate endDate;
    }

    /**
     * Response DTO for budget information
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private BigDecimal amount;
        private BigDecimal spent;
        private BigDecimal remaining;
        private Budget.BudgetPeriod period;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long userId;
        private boolean active;
        private boolean expired;
        private String createdAt;
        private String updatedAt;
    }
}
