package com.finance.tracker.controller;

import com.finance.tracker.dto.TransactionDTO;
import com.finance.tracker.entity.Transaction;
import com.finance.tracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Transaction Controller
 * Handles transaction management HTTP requests
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * Create a new transaction
     * POST /api/transactions
     */
    @PostMapping
    public ResponseEntity<?> createTransaction(@Valid @RequestBody TransactionDTO.CreateRequest request) {
        try {
            log.info("Create transaction request received");
            TransactionDTO.Response response = transactionService.createTransaction(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Create transaction failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to create transaction. Please try again."));
        }
    }

    /**
     * Get all transactions for current user
     * GET /api/transactions
     */
    @GetMapping
    public ResponseEntity<?> getAllTransactions() {
        try {
            log.info("Get all transactions request received");
            List<TransactionDTO.Response> response = transactionService.getAllTransactions();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch transactions. Please try again."));
        }
    }

    /**
     * Get a single transaction by ID
     * GET /api/transactions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        try {
            log.info("Get transaction request received for ID: {}", id);
            TransactionDTO.Response response = transactionService.getTransactionById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Get transaction failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error fetching transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch transaction. Please try again."));
        }
    }

    /**
     * Get transactions for a specific category
     * GET /api/transactions/category/{categoryId}
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<?> getTransactionsByCategory(@PathVariable Long categoryId) {
        try {
            log.info("Get transactions by category request received for category ID: {}", categoryId);
            List<TransactionDTO.Response> response = transactionService.getTransactionsByCategory(categoryId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Get transactions by category failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error fetching transactions by category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch transactions. Please try again."));
        }
    }

    /**
     * Get transactions by date range
     * GET /api/transactions/range?startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/range")
    public ResponseEntity<?> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            log.info("Get transactions by date range request received: {} to {}", startDate, endDate);
            List<TransactionDTO.Response> response = transactionService.getTransactionsByDateRange(startDate, endDate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching transactions by date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch transactions. Please try again."));
        }
    }

    /**
     * Get transactions by type (INCOME or EXPENSE)
     * GET /api/transactions/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<?> getTransactionsByType(@PathVariable Transaction.TransactionType type) {
        try {
            log.info("Get transactions by type request received: {}", type);
            List<TransactionDTO.Response> response = transactionService.getTransactionsByType(type);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error fetching transactions by type", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch transactions. Please try again."));
        }
    }

    /**
     * Update a transaction
     * PUT /api/transactions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDTO.UpdateRequest request) {
        try {
            log.info("Update transaction request received for ID: {}", id);
            TransactionDTO.Response response = transactionService.updateTransaction(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Update transaction failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to update transaction. Please try again."));
        }
    }

    /**
     * Delete a transaction
     * DELETE /api/transactions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        try {
            log.info("Delete transaction request received for ID: {}", id);
            transactionService.deleteTransaction(id);
            return ResponseEntity.ok(new SuccessResponse("Transaction deleted successfully"));
        } catch (IllegalArgumentException e) {
            log.error("Delete transaction failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error deleting transaction", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to delete transaction. Please try again."));
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
