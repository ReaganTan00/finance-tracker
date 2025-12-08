package com.finance.tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Objects for Category Management
 */
public class CategoryDTO {

    /**
     * Request DTO for creating a category
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotBlank(message = "Category name is required")
        @Size(min = 1, max = 50, message = "Category name must be between 1 and 50 characters")
        private String name;

        @Size(max = 100, message = "Icon name must not exceed 100 characters")
        private String icon;

        @Size(max = 7, message = "Color must be a valid hex color code")
        private String color;

        @Size(max = 200, message = "Description must not exceed 200 characters")
        private String description;
    }

    /**
     * Request DTO for updating a category
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {

        @Size(min = 1, max = 50, message = "Category name must be between 1 and 50 characters")
        private String name;

        @Size(max = 100, message = "Icon name must not exceed 100 characters")
        private String icon;

        @Size(max = 7, message = "Color must be a valid hex color code")
        private String color;

        @Size(max = 200, message = "Description must not exceed 200 characters")
        private String description;
    }

    /**
     * Response DTO for category information
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String name;
        private String icon;
        private String color;
        private String description;
        private Long userId;
        private String createdAt;
        private String updatedAt;
    }
}
