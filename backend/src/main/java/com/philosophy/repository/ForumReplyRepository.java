package com.philosophy.repository;

import com.philosophy.model.ForumReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ForumReplyRepository extends JpaRepository<ForumReply, Long> {

    @Query("SELECT r FROM ForumReply r JOIN FETCH r.author LEFT JOIN FETCH r.parent " +
            "WHERE r.thread.id = :threadId ORDER BY r.createdAt ASC, r.id ASC")
    List<ForumReply> findByThreadId(@Param("threadId") Long threadId);

    @Query("SELECT r FROM ForumReply r JOIN FETCH r.author JOIN FETCH r.thread WHERE r.id = :id")
    Optional<ForumReply> findWithThread(@Param("id") Long id);

    List<ForumReply> findByParentId(Long parentId);

    @Query("SELECT MAX(r.createdAt) FROM ForumReply r WHERE r.thread.id = :threadId")
    LocalDateTime findLatestCreatedAt(@Param("threadId") Long threadId);
}
