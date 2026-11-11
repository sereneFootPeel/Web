package com.philosophy.service;

import com.philosophy.model.ForumCategory;
import com.philosophy.model.ForumReply;
import com.philosophy.model.ForumThread;
import com.philosophy.model.User;
import com.philosophy.repository.ForumCategoryRepository;
import com.philosophy.repository.ForumReplyRepository;
import com.philosophy.repository.ForumThreadRepository;
import com.philosophy.util.InputValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ForumService {

    private final ForumCategoryRepository categoryRepository;
    private final ForumThreadRepository threadRepository;
    private final ForumReplyRepository replyRepository;

    public ForumService(ForumCategoryRepository categoryRepository,
                        ForumThreadRepository threadRepository,
                        ForumReplyRepository replyRepository) {
        this.categoryRepository = categoryRepository;
        this.threadRepository = threadRepository;
        this.replyRepository = replyRepository;
    }

    @Transactional(readOnly = true)
    public List<ForumCategory> listCategories() {
        return categoryRepository.findAllByOrderBySortOrderAscIdAsc();
    }

    @Transactional(readOnly = true)
    public Page<ForumThread> listThreads(Long categoryId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        if (categoryId != null && !categoryRepository.existsById(categoryId)) {
            throw new IllegalArgumentException("板块不存在");
        }
        return threadRepository.findPage(categoryId, PageRequest.of(safePage, safeSize));
    }

    @Transactional(readOnly = true)
    public List<ForumThread> searchThreads(String keyword) {
        String normalized = normalizeKeyword(keyword);
        if (normalized == null) {
            return List.of();
        }
        return threadRepository.searchByKeyword(normalized);
    }

    @Transactional(readOnly = true)
    public ForumThread findThread(Long id) {
        return threadRepository.findDetailedById(id).orElse(null);
    }

    @Transactional
    public ForumThread viewThread(Long id) {
        ForumThread thread = threadRepository.findDetailedById(id).orElse(null);
        if (thread == null) {
            return null;
        }
        threadRepository.incrementViewCount(id);
        return thread;
    }

    @Transactional(readOnly = true)
    public ForumReply findReply(Long id) {
        return replyRepository.findWithThread(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ForumReply> listReplies(Long threadId) {
        return replyRepository.findByThreadId(threadId);
    }

    @Transactional
    public ForumThread createThread(User author, Long categoryId, String title, String body) {
        if (categoryId == null) {
            throw new IllegalArgumentException("请选择板块");
        }
        ForumCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("板块不存在"));

        LocalDateTime now = LocalDateTime.now();
        ForumThread thread = new ForumThread();
        thread.setCategory(category);
        thread.setAuthor(author);
        thread.setTitle(sanitize(title, "标题", 2, 80));
        thread.setBody(sanitize(body, "正文", 1, 8000));
        thread.setReplyCount(0);
        thread.setViewCount(0);
        thread.setPinned(false);
        thread.setLocked(false);
        thread.setCreatedAt(now);
        thread.setUpdatedAt(now);
        thread.setLastActivityAt(now);
        return threadRepository.save(thread);
    }

    @Transactional
    public void updateThread(Long threadId, String title, String body, Long categoryId) {
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        thread.setTitle(sanitize(title, "标题", 2, 80));
        thread.setBody(sanitize(body, "正文", 1, 8000));
        if (categoryId != null && (thread.getCategory() == null || !categoryId.equals(thread.getCategory().getId()))) {
            ForumCategory category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("板块不存在"));
            thread.setCategory(category);
        }
        thread.setUpdatedAt(LocalDateTime.now());
        threadRepository.save(thread);
    }

    @Transactional
    public ForumReply createReply(User author, Long threadId, Long parentId, String body) {
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        if (thread.isLocked()) {
            throw new IllegalArgumentException("该帖已锁定，不能回复");
        }

        ForumReply reply = new ForumReply();
        reply.setThread(thread);
        reply.setAuthor(author);
        reply.setBody(sanitize(body, "回复", 1, 5000));
        if (parentId != null) {
            ForumReply parent = replyRepository.findWithThread(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("要回复的楼层不存在"));
            if (parent.getThread() == null || !threadId.equals(parent.getThread().getId())) {
                throw new IllegalArgumentException("回复不属于该帖");
            }
            while (parent.getParent() != null) {
                parent = parent.getParent();
            }
            reply.setParent(parent);
        }

        LocalDateTime now = LocalDateTime.now();
        reply.setCreatedAt(now);
        reply.setUpdatedAt(now);
        ForumReply saved = replyRepository.save(reply);
        threadRepository.adjustActivity(threadId, 1, now);
        return saved;
    }

    @Transactional
    public void updateReply(Long replyId, String body) {
        ForumReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new IllegalArgumentException("回复不存在"));
        reply.setBody(sanitize(body, "回复", 1, 5000));
        reply.setUpdatedAt(LocalDateTime.now());
        replyRepository.save(reply);
    }

    @Transactional
    public void deleteThread(Long threadId) {
        if (!threadRepository.existsById(threadId)) {
            throw new IllegalArgumentException("帖子不存在");
        }
        List<ForumReply> replies = replyRepository.findByThreadId(threadId);
        for (ForumReply reply : replies) {
            if (reply.getParent() != null) {
                replyRepository.delete(reply);
            }
        }
        for (ForumReply reply : replies) {
            if (reply.getParent() == null) {
                replyRepository.delete(reply);
            }
        }
        threadRepository.deleteById(threadId);
    }

    @Transactional
    public void deleteReply(Long replyId) {
        ForumReply reply = replyRepository.findWithThread(replyId)
                .orElseThrow(() -> new IllegalArgumentException("回复不存在"));
        Long threadId = reply.getThread().getId();
        int removed = deleteTree(reply);
        LocalDateTime latest = replyRepository.findLatestCreatedAt(threadId);
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        LocalDateTime activity = latest != null ? latest : thread.getCreatedAt();
        threadRepository.adjustActivity(threadId, -removed, activity);
    }

    @Transactional
    public void setPinned(Long threadId, boolean pinned) {
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        thread.setPinned(pinned);
        threadRepository.save(thread);
    }

    @Transactional
    public void setLocked(Long threadId, boolean locked) {
        ForumThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("帖子不存在"));
        thread.setLocked(locked);
        threadRepository.save(thread);
    }

    private int deleteTree(ForumReply reply) {
        int count = 1;
        for (ForumReply child : replyRepository.findByParentId(reply.getId())) {
            count += deleteTree(child);
        }
        replyRepository.delete(reply);
        return count;
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null) {
            return null;
        }
        String trimmed = keyword.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() > 80) {
            trimmed = trimmed.substring(0, 80);
        }
        return trimmed.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private String sanitize(String value, String field, int min, int max) {
        String sanitized = InputValidator.sanitizeInput(value);
        if (sanitized == null || sanitized.isBlank()) {
            throw new IllegalArgumentException(field + "不能为空");
        }
        String normalized = sanitized
                .replace("\r\n", "\n")
                .replace('\r', '\n')
                .replace("<", "＜")
                .replace(">", "＞");
        if (normalized.length() < min) {
            throw new IllegalArgumentException(field + "至少 " + min + " 个字符");
        }
        if (normalized.length() > max) {
            throw new IllegalArgumentException(field + "不能超过" + max + "个字符");
        }
        return normalized;
    }
}
