package com.finance.tracker.repository;

import com.finance.tracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Find all categories for a specific user
     */
    List<Category> findByUserId(Long userId);

    /**
     * Find a category by ID and user ID
     */
    Optional<Category> findByIdAndUserId(Long id, Long userId);

    /**
     * Check if a category name already exists for a user
     */
    boolean existsByNameAndUserId(String name, Long userId);

    /**
     * Check if a user has any categories
     */
    boolean existsByUserId(Long userId);

    /**
     * Delete a category by ID and user ID
     */
    void deleteByIdAndUserId(Long id, Long userId);
}
