package com.philosophy.repository;

import com.philosophy.model.ForumCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ForumCategoryRepository extends JpaRepository<ForumCategory, Long> {

    Optional<ForumCategory> findBySlug(String slug);

    List<ForumCategory> findAllByOrderBySortOrderAscIdAsc();
}
