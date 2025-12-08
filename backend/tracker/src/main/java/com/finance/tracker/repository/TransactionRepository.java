package com.finance.tracker.repository;

import com.finance.tracker.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Transaction entity
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Find all transactions for a specific user
     */
    List<Transaction> findByUserId(Long userId);

    /**
     * Find a transaction by ID and user ID
     */
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    /**
     * Find all transactions for a specific category
     */
    List<Transaction> findByCategoryId(Long categoryId);

    /**
     * Find all transactions for a specific budget
     */
    List<Transaction> findByBudgetId(Long budgetId);

    /**
     * Find all transactions for a specific user and category
     */
    List<Transaction> findByUserIdAndCategoryId(Long userId, Long categoryId);

    /**
     * Find transactions within a date range for a user
     */
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Find transactions by type for a user
     */
    List<Transaction> findByUserIdAndType(Long userId, Transaction.TransactionType type);

    /**
     * Calculate total amount spent in a budget
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.budgetId = :budgetId AND t.type = 'EXPENSE'")
    BigDecimal calculateTotalSpentForBudget(@Param("budgetId") Long budgetId);

    /**
     * Calculate total expenses for a user in a date range
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.type = 'EXPENSE' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalExpenses(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Calculate total income for a user in a date range
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.userId = :userId AND t.type = 'INCOME' " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalIncome(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Delete a transaction by ID and user ID
     */
    void deleteByIdAndUserId(Long id, Long userId);
}
