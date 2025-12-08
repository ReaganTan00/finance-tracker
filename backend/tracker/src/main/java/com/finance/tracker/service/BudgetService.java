package com.finance.tracker.service;

import com.finance.tracker.dto.BudgetDTO;
import com.finance.tracker.entity.Budget;
import com.finance.tracker.entity.Category;
import com.finance.tracker.repository.BudgetRepository;
import com.finance.tracker.repository.CategoryRepository;
import com.finance.tracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Budget Service
 * Handles budget management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Create a new budget
     */
    @Transactional
    public BudgetDTO.Response createBudget(BudgetDTO.CreateRequest request) {
        var currentUser = userService.getCurrentUser();
        log.info("Creating budget for user {}", currentUser.getId());

        // Verify category exists and belongs to user
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Budget budget = Budget.builder()
                .categoryId(request.getCategoryId())
                .amount(request.getAmount())
                .period(request.getPeriod())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .userId(currentUser.getId())
                .build();

        Budget savedBudget = budgetRepository.save(budget);
        log.info("Budget created successfully with ID: {}", savedBudget.getId());

        return mapToResponse(savedBudget, category);
    }

    /**
     * Get all budgets for current user
     */
    @Transactional(readOnly = true)
    public List<BudgetDTO.Response> getAllBudgets() {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching all budgets for user {}", currentUser.getId());

        List<Budget> budgets = budgetRepository.findByUserId(currentUser.getId());
        return budgets.stream()
                .map(budget -> {
                    Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
                    return mapToResponse(budget, category);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get active budgets for current user
     */
    @Transactional(readOnly = true)
    public List<BudgetDTO.Response> getActiveBudgets() {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching active budgets for user {}", currentUser.getId());

        List<Budget> budgets = budgetRepository.findActiveBudgetsByUserId(currentUser.getId(), LocalDate.now());
        return budgets.stream()
                .map(budget -> {
                    Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
                    return mapToResponse(budget, category);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get a single budget by ID
     */
    @Transactional(readOnly = true)
    public BudgetDTO.Response getBudgetById(Long budgetId) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching budget {} for user {}", budgetId, currentUser.getId());

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
        return mapToResponse(budget, category);
    }

    /**
     * Get budgets for a specific category
     */
    @Transactional(readOnly = true)
    public List<BudgetDTO.Response> getBudgetsByCategory(Long categoryId) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching budgets for category {} and user {}", categoryId, currentUser.getId());

        // Verify category belongs to user
        Category category = categoryRepository.findByIdAndUserId(categoryId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        List<Budget> budgets = budgetRepository.findByUserIdAndCategoryId(currentUser.getId(), categoryId);
        return budgets.stream()
                .map(budget -> mapToResponse(budget, category))
                .collect(Collectors.toList());
    }

    /**
     * Update a budget
     */
    @Transactional
    public BudgetDTO.Response updateBudget(Long budgetId, BudgetDTO.UpdateRequest request) {
        var currentUser = userService.getCurrentUser();
        log.info("Updating budget {} for user {}", budgetId, currentUser.getId());

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        // Update fields if provided
        if (request.getAmount() != null) {
            budget.setAmount(request.getAmount());
        }

        if (request.getPeriod() != null) {
            budget.setPeriod(request.getPeriod());
        }

        if (request.getStartDate() != null) {
            budget.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            budget.setEndDate(request.getEndDate());
        }

        // Validate dates
        if (budget.getEndDate().isBefore(budget.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Budget updatedBudget = budgetRepository.save(budget);
        log.info("Budget {} updated successfully", budgetId);

        Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
        return mapToResponse(updatedBudget, category);
    }

    /**
     * Delete a budget
     */
    @Transactional
    public void deleteBudget(Long budgetId) {
        var currentUser = userService.getCurrentUser();
        log.info("Deleting budget {} for user {}", budgetId, currentUser.getId());

        Budget budget = budgetRepository.findByIdAndUserId(budgetId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        budgetRepository.delete(budget);
        log.info("Budget {} deleted successfully", budgetId);
    }

    /**
     * Map Budget entity to Response DTO with calculations
     */
    private BudgetDTO.Response mapToResponse(Budget budget, Category category) {
        // Calculate spent amount for this budget
        BigDecimal spent = transactionRepository.calculateTotalSpentForBudget(budget.getId());
        BigDecimal remaining = budget.getAmount().subtract(spent);

        return BudgetDTO.Response.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .amount(budget.getAmount())
                .spent(spent)
                .remaining(remaining)
                .period(budget.getPeriod())
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .userId(budget.getUserId())
                .active(budget.isActive())
                .expired(budget.isExpired())
                .createdAt(budget.getCreatedAt() != null ? budget.getCreatedAt().format(DATE_FORMATTER) : null)
                .updatedAt(budget.getUpdatedAt() != null ? budget.getUpdatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
}
