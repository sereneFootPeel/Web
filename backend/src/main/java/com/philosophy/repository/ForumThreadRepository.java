package com.philosophy.repository;

import com.philosophy.model.ForumThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {

    @Query(
            value = "SELECT t FROM ForumThread t JOIN FETCH t.author JOIN FETCH t.category " +
                    "WHERE (:categoryId IS NULL OR t.category.id = :categoryId) " +
                    "AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ESCAPE '\\' " +
                    "OR LOWER(t.body) LIKE LOWER(CONCAT('%', :keyword, '%')) ESCAPE '\\') " +
                    "ORDER BY t.pinned DESC, t.lastActivityAt DESC, t.id DESC",
            countQuery = "SELECT COUNT(t) FROM ForumThread t " +
                    "WHERE (:categoryId IS NULL OR t.category.id = :categoryId) " +
                    "AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')) ESCAPE '\\' " +
                    "OR LOWER(t.body) LIKE LOWER(CONCAT('%', :keyword, '%')) ESCAPE '\\')"
    )
    Page<ForumThread> search(@Param("categoryId") Long categoryId, @Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT t FROM ForumThread t JOIN FETCH t.author JOIN FETCH t.category WHERE t.id = :id")
    Optional<ForumThread> findDetailedById(@Param("id") Long id);

    @Modifying
    @Query("UPDATE ForumThread t SET t.viewCount = t.viewCount + 1 WHERE t.id = :id")
    int incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE ForumThread t SET t.replyCount = CASE WHEN t.replyCount + :delta < 0 THEN 0 ELSE t.replyCount + :delta END, " +
            "t.lastActivityAt = :activityAt WHERE t.id = :id")
    int adjustActivity(@Param("id") Long id, @Param("delta") int delta, @Param("activityAt") LocalDateTime activityAt);
}
