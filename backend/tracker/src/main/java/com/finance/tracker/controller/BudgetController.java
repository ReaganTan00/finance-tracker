package com.finance.tracker.controller;

import com.finance.tracker.dto.BudgetDTO;
import com.finance.tracker.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Budget Controller
 * Handles budget management HTTP requests
 */
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {

    private final BudgetService budgetService;

    /**
     * Create a new budget
     * POST /api/budgets
     */
    @PostMapping
    public ResponseEntity<?> createBudget(@Valid @RequestBody BudgetDTO.CreateRequest request) {
        try {
            log.info("Create budget request received");
            BudgetDTO.Response response = budgetService.createBudget(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Create budget failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating budget", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create budget. Please try again."));
        }
    }

    /**
     * Get all budgets for current user
     * GET /api/budgets
     */
    @GetMapping
    public ResponseEntity<?> getAllBudgets() {
        try {
            log.info("Get all budgets request received");
            List<BudgetDTO.Response> response = budgetService.getAllBudgets();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching budgets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch budgets. Please try again."));
        }
    }

    /**
     * Get active budgets for current user
     * GET /api/budgets/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveBudgets() {
        try {
            log.info("Get active budgets request received");
            List<BudgetDTO.Response> response = budgetService.getActiveBudgets();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching active budgets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch active budgets. Please try again."));
        }
    }

    /**
     * Get a single budget by ID
     * GET /api/budgets/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBudgetById(@PathVariable Long id) {
        try {
            log.info("Get budget request received for ID: {}", id);
            BudgetDTO.Response response = budgetService.getBudgetById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Get budget failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error fetching budget", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch budget. Please try again."));
        }
    }

    /**
     * Get budgets for a specific category
     * GET /api/budgets/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getBudgetsByCategory(@PathVariable Long categoryId) {
        try {
            log.info("Get budgets by category request received for category ID: {}", categoryId);
            List<BudgetDTO.Response> response = budgetService.getBudgetsByCategory(categoryId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Get budgets by category failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error fetching budgets by category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch budgets. Please try again."));
        }
    }

    /**
     * Update a budget
     * PUT /api/budgets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetDTO.UpdateRequest request) {
        try {
            log.info("Update budget request received for ID: {}", id);
            BudgetDTO.Response response = budgetService.updateBudget(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Update budget failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating budget", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update budget. Please try again."));
        }
    }

    /**
     * Delete a budget
     * DELETE /api/budgets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        try {
            log.info("Delete budget request received for ID: {}", id);
            budgetService.deleteBudget(id);
            return ResponseEntity.ok(new SuccessResponse("Budget deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Delete budget failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting budget", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete budget. Please try again."));
        }
    }

    /**
     * Error response DTO
     */
    private record ErrorResponse(String message) {}

    /**
     * Success response DTO
     */
    private record SuccessResponse(String message) {}
}
