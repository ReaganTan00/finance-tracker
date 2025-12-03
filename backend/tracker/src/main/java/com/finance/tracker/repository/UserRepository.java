package com.finance.tracker.repository;

import com.finance.tracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for User entity
 * Follows Dependency Inversion Principle - depends on abstraction (JpaRepository)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email
     * @param email user's email
     * @return Optional containing user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if email already exists
     * @param email email to check
     * @return true if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Find user by partner ID
     * @param partnerId ID of the partner
     * @return Optional containing user if found
     */
    Optional<User> findByPartnerId(Long partnerId);

    /**
     * Find users who sent partner request to specific user
     * @param userId ID of the user who received request
     * @return Optional containing user who sent request
     */
    @Query("SELECT u FROM User u WHERE u.partnerRequestSentTo = :userId")
    Optional<User> findPartnerRequestSender(@Param("userId") Long userId);

    /**
     * Find users who received partner request from specific user
     * @param userId ID of the user who sent request
     * @return Optional containing user who received request
     */
    @Query("SELECT u FROM User u WHERE u.partnerRequestReceivedFrom = :userId")
    Optional<User> findPartnerRequestReceiver(@Param("userId") Long userId);
}