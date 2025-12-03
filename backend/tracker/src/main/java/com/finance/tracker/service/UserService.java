package com.finance.tracker.service;

import com.finance.tracker.dto.AuthDTO;
import com.finance.tracker.entity.User;
import com.finance.tracker.repository.UserRepository;
import com.finance.tracker.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * User Service
 * Handles user profile management operations
 * Follows Single Responsibility Principle - manages only user operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Get currently authenticated user
     * @return User entity
     * @throws UsernameNotFoundException if user not found
     */
    public User getCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    /**
     * Get user profile by ID
     * @param userId user ID
     * @return user profile response
     */
    @Transactional(readOnly = true)
    public AuthDTO.UserResponse getUserProfile(Long userId) {
        log.info("Fetching profile for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        return mapToUserResponse(user);
    }

    /**
     * Get current user's profile
     * @return user profile response
     */
    @Transactional(readOnly = true)
    public AuthDTO.UserResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        log.info("Fetching current user profile: {}", user.getEmail());
        return mapToUserResponse(user);
    }

    /**
     * Update user profile
     * @param request update details
     * @return updated user profile
     */
    @Transactional
    public AuthDTO.UserResponse updateProfile(AuthDTO.UpdateProfileRequest request) {
        User user = getCurrentUser();
        log.info("Updating profile for user: {}", user.getEmail());

        // Update name if provided
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
            log.debug("Updated name to: {}", request.getName());
        }

        // Update email if provided and different
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());
            log.debug("Updated email to: {}", request.getEmail());
        }

        User updatedUser = userRepository.save(user);
        log.info("Profile updated successfully for user ID: {}", updatedUser.getId());

        return mapToUserResponse(updatedUser);
    }

    /**
     * Change user password
     * @param request password change details
     */
    @Transactional
    public void changePassword(AuthDTO.ChangePasswordRequest request) {
        User user = getCurrentUser();
        log.info("Changing password for user: {}", user.getEmail());

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Password change failed - incorrect current password for user: {}", user.getEmail());
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getEmail());
    }

    /**
     * Delete user account
     */
    @Transactional
    public void deleteAccount() {
        User user = getCurrentUser();
        log.info("Deleting account for user: {}", user.getEmail());

        // If user has a partner, remove partner link
        if (user.hasPartner()) {
            User partner = userRepository.findById(user.getPartnerId())
                    .orElse(null);
            if (partner != null) {
                partner.setPartnerId(null);
                userRepository.save(partner);
                log.debug("Removed partner link from user ID: {}", partner.getId());
            }
        }

        userRepository.delete(user);
        log.info("Account deleted successfully for user: {}", user.getEmail());
    }

    /**
     * Map User entity to UserResponse DTO
     * Follows DRY principle - centralized mapping logic
     */
    private AuthDTO.UserResponse mapToUserResponse(User user) {
        return AuthDTO.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .partnerId(user.getPartnerId())
                .partnerRequestSentTo(user.getPartnerRequestSentTo())
                .partnerRequestReceivedFrom(user.getPartnerRequestReceivedFrom())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
}