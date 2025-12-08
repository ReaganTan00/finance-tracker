package com.finance.tracker.repository;

import com.finance.tracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Budget entity
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    /**
     * Find all budgets for a specific user
     */
    List<Budget> findByUserId(Long userId);

    /**
     * Find a budget by ID and user ID
     */
    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    /**
     * Find all budgets for a specific category
     */
    List<Budget> findByCategoryId(Long categoryId);

    /**
     * Find all budgets for a specific user and category
     */
    List<Budget> findByUserIdAndCategoryId(Long userId, Long categoryId);

    /**
     * Find active budgets for a user (not expired)
     */
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.endDate >= :today")
    List<Budget> findActiveBudgetsByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

    /**
     * Find budgets within a date range for a user
     */
    @Query("SELECT b FROM Budget b WHERE b.userId = :userId " +
           "AND b.startDate <= :endDate AND b.endDate >= :startDate")
    List<Budget> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Delete a budget by ID and user ID
     */
    void deleteByIdAndUserId(Long id, Long userId);
}
