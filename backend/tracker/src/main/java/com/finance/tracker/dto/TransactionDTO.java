package com.finance.tracker.dto;

import com.finance.tracker.entity.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Objects for Transaction Management
 */
public class TransactionDTO {

    /**
     * Request DTO for creating a transaction
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Transaction amount is required")
        @Positive(message = "Transaction amount must be positive")
        private BigDecimal amount;

        @NotNull(message = "Transaction type is required")
        private Transaction.TransactionType type;

        @Size(max = 200, message = "Description must not exceed 200 characters")
        private String description;

        @NotNull(message = "Transaction date is required")
        private LocalDate transactionDate;
    }

    /**
     * Request DTO for updating a transaction
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {

        private Long categoryId;

        @Positive(message = "Transaction amount must be positive")
        private BigDecimal amount;

        private Transaction.TransactionType type;

        @Size(max = 200, message = "Description must not exceed 200 characters")
        private String description;

        private LocalDate transactionDate;
    }

    /**
     * Response DTO for transaction information
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
        private Transaction.TransactionType type;
        private String description;
        private LocalDate transactionDate;
        private Long userId;
        private String createdAt;
        private String updatedAt;
    }
}
