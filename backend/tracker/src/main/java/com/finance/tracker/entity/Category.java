package com.finance.tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Category entity representing budget categories.
 * Users can create custom categories for organizing budgets and transactions.
 * Follows Single Responsibility Principle - handles only category data.
 */
@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_category_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 50, message = "Category name must be between 1 and 50 characters")
    @Column(nullable = false, length = 50)
    private String name;

    @Size(max = 100, message = "Icon name must not exceed 100 characters")
    @Column(length = 100)
    private String icon;

    @Size(max = 7, message = "Color must be a valid hex color code")
    @Column(length = 7)
    private String color;

    @Size(max = 200, message = "Description must not exceed 200 characters")
    @Column(length = 200)
    private String description;

    @DecimalMin(value = "0.0", inclusive = true, message = "Planned monthly budget must be non-negative")
    @Column(name = "planned_monthly_budget", precision = 19, scale = 2)
    private BigDecimal plannedMonthlyBudget;

    @NotNull(message = "User ID is required")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
