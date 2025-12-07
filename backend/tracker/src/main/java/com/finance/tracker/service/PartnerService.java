package com.finance.tracker.service;

import com.finance.tracker.dto.PartnerDTO;
import com.finance.tracker.entity.User;
import com.finance.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

/**
 * Partner Service
 * Handles partner connection and management operations
 * Follows Single Responsibility Principle - manages only partner-related operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PartnerService {

    private final UserRepository userRepository;
    private final UserService userService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Send partner request by email
     * @param request partner request containing email
     * @return partner response with updated status
     */
    @Transactional
    public PartnerDTO.PartnerResponse sendPartnerRequestByEmail(PartnerDTO.PartnerRequestByEmail request) {
        User currentUser = userService.getCurrentUser();
        log.info("User {} sending partner request to email: {}", currentUser.getEmail(), request.getPartnerEmail());

        // Validate current user doesn't already have a partner
        if (currentUser.hasPartner()) {
            throw new IllegalStateException("You already have a partner. Please unlink before sending a new request.");
        }

        // Validate current user doesn't have a pending request
        if (currentUser.hasPendingRequest()) {
            throw new IllegalStateException("You already have a pending partner request. Please resolve it first.");
        }

        // Validate not sending request to self
        if (currentUser.getEmail().equalsIgnoreCase(request.getPartnerEmail())) {
            throw new IllegalArgumentException("You cannot send a partner request to yourself");
        }

        // Find partner by email
        User partner = userRepository.findByEmail(request.getPartnerEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getPartnerEmail()));

        // Validate partner doesn't already have a partner
        if (partner.hasPartner()) {
            throw new IllegalStateException("This user already has a partner");
        }

        // Check if partner already sent a request to current user
        if (partner.getPartnerRequestSentTo() != null &&
            partner.getPartnerRequestSentTo().equals(currentUser.getId())) {
            // Auto-accept if mutual request
            return acceptMutualRequest(currentUser, partner);
        }

        // Validate partner doesn't have a pending request
        if (partner.hasPendingRequest()) {
            throw new IllegalStateException("This user already has a pending partner request");
        }

        // Send partner request
        currentUser.setPartnerRequestSentTo(partner.getId());
        partner.setPartnerRequestReceivedFrom(currentUser.getId());

        userRepository.save(currentUser);
        userRepository.save(partner);

        log.info("Partner request sent successfully from user {} to {}", currentUser.getId(), partner.getId());

        return PartnerDTO.PartnerResponse.builder()
                .message("Partner request sent successfully")
                .status(getPartnerStatus(currentUser))
                .build();
    }

    /**
     * Accept partner request
     * Links both users as partners
     * @return partner response with updated status
     */
    @Transactional
    public PartnerDTO.PartnerResponse acceptPartnerRequest() {
        User currentUser = userService.getCurrentUser();
        log.info("User {} accepting partner request", currentUser.getEmail());

        // Validate user has a pending incoming request
        if (currentUser.getPartnerRequestReceivedFrom() == null) {
            throw new IllegalStateException("No pending partner request to accept");
        }

        // Find the user who sent the request
        User partner = userRepository.findById(currentUser.getPartnerRequestReceivedFrom())
                .orElseThrow(() -> new IllegalStateException("Partner request sender not found"));

        // Link both users as partners
        currentUser.setPartnerId(partner.getId());
        currentUser.setPartnerRequestReceivedFrom(null);

        partner.setPartnerId(currentUser.getId());
        partner.setPartnerRequestSentTo(null);

        userRepository.save(currentUser);
        userRepository.save(partner);

        log.info("Partner request accepted. Users {} and {} are now partners", currentUser.getId(), partner.getId());

        return PartnerDTO.PartnerResponse.builder()
                .message("Partner request accepted successfully")
                .status(getPartnerStatus(currentUser))
                .build();
    }

    /**
     * Reject partner request
     * Removes the pending request
     * @return partner response with updated status
     */
    @Transactional
    public PartnerDTO.PartnerResponse rejectPartnerRequest() {
        User currentUser = userService.getCurrentUser();
        log.info("User {} rejecting partner request", currentUser.getEmail());

        // Validate user has a pending incoming request
        if (currentUser.getPartnerRequestReceivedFrom() == null) {
            throw new IllegalStateException("No pending partner request to reject");
        }

        // Find the user who sent the request
        User partner = userRepository.findById(currentUser.getPartnerRequestReceivedFrom())
                .orElseThrow(() -> new IllegalStateException("Partner request sender not found"));

        // Clear the partner request
        currentUser.setPartnerRequestReceivedFrom(null);
        partner.setPartnerRequestSentTo(null);

        userRepository.save(currentUser);
        userRepository.save(partner);

        log.info("Partner request rejected by user {}", currentUser.getId());

        return PartnerDTO.PartnerResponse.builder()
                .message("Partner request rejected successfully")
                .status(getPartnerStatus(currentUser))
                .build();
    }

    /**
     * Cancel outgoing partner request
     * @return partner response with updated status
     */
    @Transactional
    public PartnerDTO.PartnerResponse cancelPartnerRequest() {
        User currentUser = userService.getCurrentUser();
        log.info("User {} canceling partner request", currentUser.getEmail());

        // Validate user has a pending outgoing request
        if (currentUser.getPartnerRequestSentTo() == null) {
            throw new IllegalStateException("No pending partner request to cancel");
        }

        // Find the user who received the request
        User partner = userRepository.findById(currentUser.getPartnerRequestSentTo())
                .orElseThrow(() -> new IllegalStateException("Partner request receiver not found"));

        // Clear the partner request
        currentUser.setPartnerRequestSentTo(null);
        partner.setPartnerRequestReceivedFrom(null);

        userRepository.save(currentUser);
        userRepository.save(partner);

        log.info("Partner request canceled by user {}", currentUser.getId());

        return PartnerDTO.PartnerResponse.builder()
                .message("Partner request canceled successfully")
                .status(getPartnerStatus(currentUser))
                .build();
    }

    /**
     * Unlink from current partner
     * @return partner response with updated status
     */
    @Transactional
    public PartnerDTO.PartnerResponse unlinkPartner() {
        User currentUser = userService.getCurrentUser();
        log.info("User {} unlinking from partner", currentUser.getEmail());

        // Validate user has a partner
        if (!currentUser.hasPartner()) {
            throw new IllegalStateException("You don't have a partner to unlink");
        }

        // Find partner
        User partner = userRepository.findById(currentUser.getPartnerId())
                .orElseThrow(() -> new IllegalStateException("Partner not found"));

        // Unlink both users
        currentUser.setPartnerId(null);
        partner.setPartnerId(null);

        userRepository.save(currentUser);
        userRepository.save(partner);

        log.info("Users {} and {} have been unlinked", currentUser.getId(), partner.getId());

        return PartnerDTO.PartnerResponse.builder()
                .message("Successfully unlinked from partner")
                .status(getPartnerStatus(currentUser))
                .build();
    }

    /**
     * Get current partner status
     * @return partner status
     */
    @Transactional(readOnly = true)
    public PartnerDTO.PartnerStatus getPartnerStatus() {
        User currentUser = userService.getCurrentUser();
        return getPartnerStatus(currentUser);
    }

    /**
     * Get partner status for a specific user
     * Helper method to build partner status DTO
     */
    private PartnerDTO.PartnerStatus getPartnerStatus(User user) {
        PartnerDTO.PartnerInfo currentPartner = null;
        PartnerDTO.PartnerInfo outgoingRequest = null;
        PartnerDTO.PartnerInfo incomingRequest = null;

        // Get current partner info
        if (user.getPartnerId() != null) {
            User partner = userRepository.findById(user.getPartnerId()).orElse(null);
            if (partner != null) {
                currentPartner = mapToPartnerInfo(partner);
            }
        }

        // Get outgoing request info
        if (user.getPartnerRequestSentTo() != null) {
            User requestedUser = userRepository.findById(user.getPartnerRequestSentTo()).orElse(null);
            if (requestedUser != null) {
                outgoingRequest = mapToPartnerInfo(requestedUser);
            }
        }

        // Get incoming request info
        if (user.getPartnerRequestReceivedFrom() != null) {
            User requesterUser = userRepository.findById(user.getPartnerRequestReceivedFrom()).orElse(null);
            if (requesterUser != null) {
                incomingRequest = mapToPartnerInfo(requesterUser);
            }
        }

        return PartnerDTO.PartnerStatus.builder()
                .currentPartner(currentPartner)
                .outgoingRequest(outgoingRequest)
                .incomingRequest(incomingRequest)
                .hasPartner(user.hasPartner())
                .hasPendingRequest(user.hasPendingRequest())
                .build();
    }

    /**
     * Auto-accept when both users have sent requests to each other
     */
    private PartnerDTO.PartnerResponse acceptMutualRequest(User user1, User user2) {
        log.info("Mutual partner request detected. Auto-linking users {} and {}", user1.getId(), user2.getId());

        // Link both users as partners
        user1.setPartnerId(user2.getId());
        user1.setPartnerRequestSentTo(null);
        user1.setPartnerRequestReceivedFrom(null);

        user2.setPartnerId(user1.getId());
        user2.setPartnerRequestSentTo(null);
        user2.setPartnerRequestReceivedFrom(null);

        userRepository.save(user1);
        userRepository.save(user2);

        log.info("Users {} and {} are now partners (mutual request)", user1.getId(), user2.getId());

        return PartnerDTO.PartnerResponse.builder()
                .message("Partner request accepted! You are now connected.")
                .status(getPartnerStatus(user1))
                .build();
    }

    /**
     * Map User entity to PartnerInfo DTO
     */
    private PartnerDTO.PartnerInfo mapToPartnerInfo(User user) {
        return PartnerDTO.PartnerInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
}
