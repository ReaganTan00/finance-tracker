package com.finance.tracker.service;

import com.finance.tracker.dto.TransactionDTO;
import com.finance.tracker.entity.Category;
import com.finance.tracker.entity.Transaction;
import com.finance.tracker.repository.CategoryRepository;
import com.finance.tracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Transaction Service
 * Handles transaction management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    /**
     * Create a new transaction
     */
    @Transactional
    public TransactionDTO.Response createTransaction(TransactionDTO.CreateRequest request) {
        var currentUser = userService.getCurrentUser();
        log.info("Creating transaction for user {}", currentUser.getId());

        // Verify category exists and belongs to user
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Transaction transaction = Transaction.builder()
                .categoryId(request.getCategoryId())
                .amount(request.getAmount())
                .type(request.getType())
                .description(request.getDescription())
                .transactionDate(request.getTransactionDate())
                .userId(currentUser.getId())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction created successfully with ID: {}", savedTransaction.getId());

        return mapToResponse(savedTransaction, category);
    }

    /**
     * Get all transactions for current user
     */
    @Transactional(readOnly = true)
    public List<TransactionDTO.Response> getAllTransactions() {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching all transactions for user {}", currentUser.getId());

        List<Transaction> transactions = transactionRepository.findByUserId(currentUser.getId());
        return transactions.stream()
                .map(transaction -> {
                    Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
                    return mapToResponse(transaction, category);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get a single transaction by ID
     */
    @Transactional(readOnly = true)
    public TransactionDTO.Response getTransactionById(Long transactionId) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching transaction {} for user {}", transactionId, currentUser.getId());

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
        return mapToResponse(transaction, category);
    }

    /**
     * Get transactions for a specific category
     */
    @Transactional(readOnly = true)
    public List<TransactionDTO.Response> getTransactionsByCategory(Long categoryId) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching transactions for category {} and user {}", categoryId, currentUser.getId());

        // Verify category belongs to user
        Category category = categoryRepository.findByIdAndUserId(categoryId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        List<Transaction> transactions = transactionRepository.findByUserIdAndCategoryId(currentUser.getId(), categoryId);
        return transactions.stream()
                .map(transaction -> mapToResponse(transaction, category))
                .collect(Collectors.toList());
    }

    /**
     * Get transactions within a date range
     */
    @Transactional(readOnly = true)
    public List<TransactionDTO.Response> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching transactions for user {} between {} and {}",
                currentUser.getId(), startDate, endDate);

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateRange(
                currentUser.getId(), startDate, endDate);

        return transactions.stream()
                .map(transaction -> {
                    Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
                    return mapToResponse(transaction, category);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get transactions by type (INCOME or EXPENSE)
     */
    @Transactional(readOnly = true)
    public List<TransactionDTO.Response> getTransactionsByType(Transaction.TransactionType type) {
        var currentUser = userService.getCurrentUser();
        log.info("Fetching {} transactions for user {}", type, currentUser.getId());

        List<Transaction> transactions = transactionRepository.findByUserIdAndType(currentUser.getId(), type);
        return transactions.stream()
                .map(transaction -> {
                    Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
                    return mapToResponse(transaction, category);
                })
                .collect(Collectors.toList());
    }

    /**
     * Update a transaction
     */
    @Transactional
    public TransactionDTO.Response updateTransaction(Long transactionId, TransactionDTO.UpdateRequest request) {
        var currentUser = userService.getCurrentUser();
        log.info("Updating transaction {} for user {}", transactionId, currentUser.getId());

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Update category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), currentUser.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            transaction.setCategoryId(request.getCategoryId());
        }

        // Update other fields if provided
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }

        if (request.getType() != null) {
            transaction.setType(request.getType());
        }

        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }

        if (request.getTransactionDate() != null) {
            transaction.setTransactionDate(request.getTransactionDate());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        log.info("Transaction {} updated successfully", transactionId);

        Category category = categoryRepository.findById(transaction.getCategoryId()).orElse(null);
        return mapToResponse(updatedTransaction, category);
    }

    /**
     * Delete a transaction
     */
    @Transactional
    public void deleteTransaction(Long transactionId) {
        var currentUser = userService.getCurrentUser();
        log.info("Deleting transaction {} for user {}", transactionId, currentUser.getId());

        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        transactionRepository.delete(transaction);
        log.info("Transaction {} deleted successfully", transactionId);
    }

    /**
     * Map Transaction entity to Response DTO
     */
    private TransactionDTO.Response mapToResponse(Transaction transaction, Category category) {
        return TransactionDTO.Response.builder()
                .id(transaction.getId())
                .categoryId(transaction.getCategoryId())
                .categoryName(category != null ? category.getName() : null)
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .transactionDate(transaction.getTransactionDate())
                .userId(transaction.getUserId())
                .createdAt(transaction.getCreatedAt() != null ? transaction.getCreatedAt().format(DATE_FORMATTER) : null)
                .updatedAt(transaction.getUpdatedAt() != null ? transaction.getUpdatedAt().format(DATE_FORMATTER) : null)
                .build();
    }
}
