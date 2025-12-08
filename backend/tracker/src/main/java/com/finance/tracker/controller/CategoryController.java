package com.finance.tracker.controller;

import com.finance.tracker.dto.CategoryDTO;
import com.finance.tracker.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Category Controller
 * Handles category management HTTP requests
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Create a new category
     * POST /api/categories
     */
    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryDTO.CreateRequest request) {
        try {
            log.info("Create category request received");
            CategoryDTO.Response response = categoryService.createCategory(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Create category failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create category. Please try again."));
        }
    }

    /**
     * Get all categories for current user
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            log.info("Get all categories request received");
            List<CategoryDTO.Response> response = categoryService.getAllCategories();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching categories", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch categories. Please try again."));
        }
    }

    /**
     * Get a single category by ID
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        try {
            log.info("Get category request received for ID: {}", id);
            CategoryDTO.Response response = categoryService.getCategoryById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Get category failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error fetching category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch category. Please try again."));
        }
    }

    /**
     * Update a category
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryDTO.UpdateRequest request) {
        try {
            log.info("Update category request received for ID: {}", id);
            CategoryDTO.Response response = categoryService.updateCategory(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Update category failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update category. Please try again."));
        }
    }

    /**
     * Delete a category
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            log.info("Delete category request received for ID: {}", id);
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new SuccessResponse("Category deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Delete category failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete category. Please try again."));
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
