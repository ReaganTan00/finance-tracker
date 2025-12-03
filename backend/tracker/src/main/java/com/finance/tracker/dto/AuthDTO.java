package com.finance.tracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Objects for Authentication
 * Follows Interface Segregation Principle - clients only depend on what they need
 */
public class AuthDTO {

    /**
     * Request DTO for user registration
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
        private String password;
    }

    /**
     * Request DTO for user login
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    /**
     * Response DTO for authentication success
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;

        @Builder.Default
        private String type = "Bearer";

        private Long userId;
        private String name;
        private String email;
        private Long partnerId;
        private String message;
    }

    /**
     * Response DTO for user profile information
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private Long partnerId;
        private Long partnerRequestSentTo;
        private Long partnerRequestReceivedFrom;
        private String createdAt;
        private String updatedAt;
    }

    /**
     * Request DTO for updating user profile
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProfileRequest {

        @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
        private String name;

        @Email(message = "Email must be valid")
        private String email;
    }

    /**
     * Request DTO for changing password
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePasswordRequest {

        @NotBlank(message = "Current password is required")
        private String currentPassword;

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 100, message = "New password must be between 8 and 100 characters")
        private String newPassword;
    }
}
