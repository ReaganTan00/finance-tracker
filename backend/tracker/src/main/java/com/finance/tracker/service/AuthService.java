package com.finance.tracker.service;

import com.finance.tracker.dto.AuthDTO;
import com.finance.tracker.entity.User;
import com.finance.tracker.repository.UserRepository;
import com.finance.tracker.security.CustomUserDetails;
import com.finance.tracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication Service
 * Handles user registration and login logic
 * Follows Single Responsibility Principle - manages only authentication operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user
     * @param request registration details
     * @return authentication response with JWT token
     * @throws IllegalArgumentException if email already exists
     */
    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        log.info("Attempting to register user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed - email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Generate JWT token
        CustomUserDetails userDetails = CustomUserDetails.build(savedUser);
        String token = jwtService.generateToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .partnerId(savedUser.getPartnerId())
                .message("User registered successfully")
                .build();
    }

    /**
     * Authenticate user and generate token
     * @param request login credentials
     * @return authentication response with JWT token
     * @throws UsernameNotFoundException if credentials are invalid
     */
    @Transactional(readOnly = true)
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        log.info("Attempting login for user: {}", request.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("User authenticated successfully: {}", userDetails.getEmail());

        // Generate JWT token
        String token = jwtService.generateToken(userDetails);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .partnerId(userDetails.getPartnerId())
                .message("Login successful")
                .build();
    }

    /**
     * Validate JWT token
     * @param token JWT token to validate
     * @return true if token is valid
     */
    public boolean validateToken(String token) {
        try {
            String email = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            CustomUserDetails userDetails = CustomUserDetails.build(user);
            return jwtService.isTokenValid(token, userDetails);
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }
}