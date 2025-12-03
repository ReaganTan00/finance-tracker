package com.finance.tracker.controller;

import com.finance.tracker.dto.AuthDTO;
import com.finance.tracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 * Follows Single Responsibility Principle - manages only auth endpoints
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthDTO.RegisterRequest request) {
        try {
            log.info("Registration request received for email: {}", request.getEmail());
            AuthDTO.AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during registration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Registration failed. Please try again."));
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthDTO.LoginRequest request) {
        try {
            log.info("Login request received for email: {}", request.getEmail());
            AuthDTO.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Invalid email or password"));
        }
    }

    /**
     * Validate JWT token
     * GET /api/auth/validate
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Invalid authorization header"));
            }

            String token = authHeader.substring(7);
            boolean isValid = authService.validateToken(token);

            if (isValid) {
                return ResponseEntity.ok(new SuccessResponse("Token is valid"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Invalid or expired token"));
            }
        } catch (Exception e) {
            log.error("Token validation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Token validation failed"));
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