package com.finance.tracker.service;

import com.finance.tracker.dto.CategoryDTO;
import com.finance.tracker.entity.Category;
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
 * Category Service
 * Handles category management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserService userService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Create a new category
     */
    @Transactional
    public CategoryDTO.Response createCategory(CategoryDTO.CreateRequest request) {
        var currentUser = userService.getCurrentUser();
        log.info("Creating category '{}' for user {}", request.getName(), currentUser.getId());

        // Check if category name already exists for this user
        if (categoryRepository.existsByNameAndUserId(request.getName(), currentUser.getId())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .description(request.getDescription())
                .plannedMonthlyBudget(request.getPlannedMonthlyBudget())
                .userId(currentUser.getId())
                .build();

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getId());

        return mapToResponse(savedCategory);
    }

    /**
     * Get all categories for current user
     */
    @Transactional(readOnly = true)
    public List<CategoryDTO.Response> getAllCategories() {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching all categories for user {}", currentUser.getId());

        List<Category> categories = categoryRepository.findByUserId(currentUser.getId());
        return categories.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a single category by ID
     */
    @Transactional(readOnly = true)
    public CategoryDTO.Response getCategoryById(Long categoryId) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching category {} for user {}", categoryId, currentUser.getId());

        Category category = categoryRepository.findByIdAndUserId(categoryId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        return mapToResponse(category);
    }

    /**
     * Update a category
     */
    @Transactional
    public CategoryDTO.Response updateCategory(Long categoryId, CategoryDTO.UpdateRequest request) {
        var currentUser = userService.getCurrentUser();
        log.info("Updating category {} for user {}", categoryId, currentUser.getId());

        Category category = categoryRepository.findByIdAndUserId(categoryId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Update fields if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            // Check if new name conflicts with existing category
            if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByNameAndUserId(request.getName(), currentUser.getId())) {
                throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
            }
            category.setName(request.getName());
        }

        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }

        if (request.getColor() != null) {
            category.setColor(request.getColor());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getPlannedMonthlyBudget() != null) {
            category.setPlannedMonthlyBudget(request.getPlannedMonthlyBudget());
        }

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category {} updated successfully", categoryId);

        return mapToResponse(updatedCategory);
    }

    /**
     * Delete a category
     */
    @Transactional
    public void deleteCategory(Long categoryId) {
        var currentUser = userService.getCurrentUser();
        log.info("Deleting category {} for user {}", categoryId, currentUser.getId());

        // Verify category exists and belongs to user
        Category category = categoryRepository.findByIdAndUserId(categoryId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        categoryRepository.delete(category);
        log.info("Category {} deleted successfully", categoryId);
    }

    /**
     * Calculate monthly spending for a category
     * Returns the total expense amount for the current month
     */
    private BigDecimal calculateMonthlySpent(Long categoryId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        BigDecimal spent = transactionRepository.calculateTotalSpentForCategoryInDateRange(
                categoryId, startOfMonth, endOfMonth);

        return spent != null ? spent : BigDecimal.ZERO;
    }

    /**
     * Map Category entity to Response DTO
     */
    private CategoryDTO.Response mapToResponse(Category category) {
        BigDecimal plannedBudget = category.getPlannedMonthlyBudget() != null ?
                category.getPlannedMonthlyBudget() : BigDecimal.ZERO;
        BigDecimal monthlySpent = calculateMonthlySpent(category.getId());
        BigDecimal monthlyRemaining = plannedBudget.subtract(monthlySpent);

        return CategoryDTO.Response.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .description(category.getDescription())
                .plannedMonthlyBudget(plannedBudget)
                .monthlySpent(monthlySpent)
                .monthlyRemaining(monthlyRemaining)
                .userId(category.getUserId())
                .createdAt(category.getCreatedAt() != null ? category.getCreatedAt().format(DATE_FORMATTER) : null)
                .updatedAt(category.getUpdatedAt() != null ? category.getUpdatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
}
