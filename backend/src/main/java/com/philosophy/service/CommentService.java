package com.philosophy.service;

import com.philosophy.model.Comment;
import com.philosophy.model.Content;
import com.philosophy.model.User;
import com.philosophy.repository.CommentRepository;
import com.philosophy.util.InputValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ContentService contentService;

    public CommentService(CommentRepository commentRepository, ContentService contentService) {
        this.commentRepository = commentRepository;
        this.contentService = contentService;
    }

    @Transactional(readOnly = true)
    public List<Comment> findByContentId(Long contentId) {
        // 获取顶级评论（无父评论的评论）
        return commentRepository.findByContentIdAndParentIsNullOrderByCreatedAtDesc(contentId);
    }
    
    @Transactional(readOnly = true)
    public List<Comment> findRepliesByParentId(Long parentId) {
        return commentRepository.findRepliesByParentId(parentId);
    }

    @Transactional(readOnly = true)
    public long countByContentId(Long contentId) {
        return commentRepository.countByContentId(contentId);
    }

    @Transactional(readOnly = true)
    public List<Comment> findByUserId(Long userId) {
        // 使用带有JOIN FETCH的查询方法来预加载关联的内容对象
        return commentRepository.findByUserIdWithContent(userId);
    }

    @Transactional(readOnly = true)
    public long countByUserId(Long userId) {
        return commentRepository.countByUserId(userId);
    }

    @Transactional
    public Comment saveComment(Long contentId, User user, String body) {
        Content content = contentService.getContentById(contentId);
        if (content == null) {
            throw new IllegalArgumentException("Content not found with id: " + contentId);
        }

        Comment comment = new Comment(content, user, sanitizeCommentBody(body));
        // Ensure createdAt is set explicitly as a fallback
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(java.time.LocalDateTime.now());
        }
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Transactional
    public Comment saveReply(Long parentId, User user, String body) {
        Comment parent = commentRepository.findById(parentId).orElse(null);
        if (parent == null) {
            throw new IllegalArgumentException("Parent comment not found with id: " + parentId);
        }
        Comment reply = new Comment(parent.getContent(), user, sanitizeCommentBody(body));
        reply.setParent(parent);
        // Ensure createdAt is set explicitly as a fallback
        if (reply.getCreatedAt() == null) {
            reply.setCreatedAt(java.time.LocalDateTime.now());
        }
        return commentRepository.save(reply);
    }

    @Transactional(readOnly = true)
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }

    private String sanitizeCommentBody(String body) {
        String sanitized = InputValidator.sanitizeInput(body);
        if (sanitized == null || sanitized.isBlank()) {
            throw new IllegalArgumentException("评论内容不能为空");
        }

        String normalized = sanitized
            .replace("\r\n", "\n")
            .replace('\r', '\n')
            .replace("<", "＜")
            .replace(">", "＞");

        if (normalized.length() > 5000) {
            throw new IllegalArgumentException("评论内容不能超过5000个字符");
        }

        return normalized;
    }
}