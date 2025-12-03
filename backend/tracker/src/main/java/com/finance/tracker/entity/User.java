package com.finance.tracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * User entity representing application users.
 * Follows Single Responsibility Principle - handles only user data.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Column(nullable = false, length = 50)
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 60, max = 60, message = "Password hash must be 60 characters")
    @Column(nullable = false, length = 60)
    private String password;

    @Column(name = "partner_id")
    private Long partnerId;

    @Column(name = "partner_request_sent_to")
    private Long partnerRequestSentTo;

    @Column(name = "partner_request_received_from")
    private Long partnerRequestReceivedFrom;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Check if user has a partner
     */
    public boolean hasPartner() {
        return partnerId != null;
    }

    /**
     * Check if user has pending partner request
     */
    public boolean hasPendingRequest() {
        return partnerRequestSentTo != null || partnerRequestReceivedFrom != null;
    }
}