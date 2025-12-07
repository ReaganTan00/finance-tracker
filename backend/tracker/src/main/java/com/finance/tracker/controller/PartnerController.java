package com.finance.tracker.controller;

import com.finance.tracker.dto.PartnerDTO;
import com.finance.tracker.service.PartnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Partner Controller
 * Handles partner connection and management HTTP requests
 * Follows Single Responsibility Principle - manages only partner endpoints
 */
@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
@Slf4j
public class PartnerController {

    private final PartnerService partnerService;

    /**
     * Send partner request by email
     * POST /api/partner/request
     */
    @PostMapping("/request")
    public ResponseEntity<?> sendPartnerRequest(@Valid @RequestBody PartnerDTO.PartnerRequestByEmail request) {
        try {
            log.info("Partner request received for email: {}", request.getPartnerEmail());
            PartnerDTO.PartnerResponse response = partnerService.sendPartnerRequestByEmail(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Partner request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Partner request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during partner request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to send partner request. Please try again."));
        }
    }

    /**
     * Accept partner request
     * POST /api/partner/accept
     */
    @PostMapping("/accept")
    public ResponseEntity<?> acceptPartnerRequest() {
        try {
            log.info("Accepting partner request");
            PartnerDTO.PartnerResponse response = partnerService.acceptPartnerRequest();
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Accept partner request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error accepting partner request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to accept partner request. Please try again."));
        }
    }

    /**
     * Reject partner request
     * POST /api/partner/reject
     */
    @PostMapping("/reject")
    public ResponseEntity<?> rejectPartnerRequest() {
        try {
            log.info("Rejecting partner request");
            PartnerDTO.PartnerResponse response = partnerService.rejectPartnerRequest();
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Reject partner request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error rejecting partner request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to reject partner request. Please try again."));
        }
    }

    /**
     * Cancel outgoing partner request
     * DELETE /api/partner/request
     */
    @DeleteMapping("/request")
    public ResponseEntity<?> cancelPartnerRequest() {
        try {
            log.info("Canceling partner request");
            PartnerDTO.PartnerResponse response = partnerService.cancelPartnerRequest();
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Cancel partner request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error canceling partner request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to cancel partner request. Please try again."));
        }
    }

    /**
     * Unlink from current partner
     * DELETE /api/partner
     */
    @DeleteMapping
    public ResponseEntity<?> unlinkPartner() {
        try {
            log.info("Unlinking from partner");
            PartnerDTO.PartnerResponse response = partnerService.unlinkPartner();
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.error("Unlink partner failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error unlinking partner", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to unlink partner. Please try again."));
        }
    }

    /**
     * Get current partner status
     * GET /api/partner/status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getPartnerStatus() {
        try {
            log.info("Fetching partner status");
            PartnerDTO.PartnerStatus status = partnerService.getPartnerStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Unexpected error fetching partner status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch partner status. Please try again."));
        }
    }

    /**
     * Error response DTO
     */
    private record ErrorResponse(String message) {}
}
