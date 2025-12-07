package com.finance.tracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Objects for Partner Management
 * Follows Interface Segregation Principle - clients only depend on what they need
 */
public class PartnerDTO {

    /**
     * Request DTO for sending partner request by email
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerRequestByEmail {

        @NotBlank(message = "Partner email is required")
        @Email(message = "Email must be valid")
        private String partnerEmail;
    }

    /**
     * Request DTO for sending partner request by user ID
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerRequestById {

        @NotNull(message = "Partner ID is required")
        private Long partnerId;
    }

    /**
     * Response DTO for partner information
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerInfo {
        private Long id;
        private String name;
        private String email;
        private String createdAt;
    }

    /**
     * Response DTO for partner status
     * Includes current partner and pending requests
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerStatus {
        private PartnerInfo currentPartner;
        private PartnerInfo outgoingRequest;
        private PartnerInfo incomingRequest;
        private boolean hasPartner;
        private boolean hasPendingRequest;
    }

    /**
     * Generic response DTO for partner operations
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PartnerResponse {
        private String message;
        private PartnerStatus status;
    }
}
