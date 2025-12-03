package com.finance.tracker.controller;

import com.finance.tracker.dto.AuthDTO;
import com.finance.tracker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

/**
 * User Controller
 * Handles user management HTTP requests
 * Follows Single Responsibility Principle - manages only user endpoints
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Get current user's profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            log.info("Fetching current user profile");
            AuthDTO.UserResponse response = userService.getCurrentUserProfile();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to fetch current user profile", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Failed to fetch profile"));
        }
    }

    /**
     * Get user profile by ID
     * GET /api/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        try {
            log.info("Fetching profile for user ID: {}", userId);
            AuthDTO.UserResponse response = userService.getUserProfile(userId);
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            log.warn("User not found with ID: {}", userId);
            return ResponseEntity.status(404)
                    .body(new ErrorResponse("User not found"));
        } catch (Exception e) {
            log.error("Failed to fetch user profile for ID: {}", userId, e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Failed to fetch profile"));
        }
    }

    /**
     * Update current user's profile
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody AuthDTO.UpdateProfileRequest request) {
        try {
            log.info("Updating user profile");
            AuthDTO.UserResponse response = userService.updateProfile(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Profile update failed: {}", e.getMessage());
            return ResponseEntity.status(400)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update profile", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Failed to update profile"));
        }
    }

    /**
     * Change password
     * POST /api/users/me/change-password
     */
    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody AuthDTO.ChangePasswordRequest request) {
        try {
            log.info("Changing user password");
            userService.changePassword(request);
            return ResponseEntity.ok(new SuccessResponse("Password changed successfully"));
        } catch (IllegalArgumentException e) {
            log.warn("Password change failed: {}", e.getMessage());
            return ResponseEntity.status(400)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to change password", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Failed to change password"));
        }
    }

    /**
     * Delete current user's account
     * DELETE /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteAccount() {
        try {
            log.info("Deleting user account");
            userService.deleteAccount();
            return ResponseEntity.ok(new SuccessResponse("Account deleted successfully"));
        } catch (Exception e) {
            log.error("Failed to delete account", e);
            return ResponseEntity.status(500)
                    .body(new ErrorResponse("Failed to delete account"));
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