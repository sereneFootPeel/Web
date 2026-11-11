package com.philosophy.service;

import com.philosophy.model.ForumCategory;
import com.philosophy.model.ForumReply;
import com.philosophy.model.ForumThread;
import com.philosophy.model.Philosopher;
import com.philosophy.model.User;
import com.philosophy.repository.CommentRepository;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.ContentTranslationRepository;
import com.philosophy.repository.ForumCategoryRepository;
import com.philosophy.repository.ForumReplyRepository;
import com.philosophy.repository.ForumThreadRepository;
import com.philosophy.repository.LikeRepository;
import com.philosophy.repository.PhilosopherRepository;
import com.philosophy.repository.PhilosopherTranslationRepository;
import com.philosophy.repository.SchoolRepository;
import com.philosophy.repository.SchoolTranslationRepository;
import com.philosophy.repository.UserBlockRepository;
import com.philosophy.repository.UserContentEditRepository;
import com.philosophy.repository.UserFollowRepository;
import com.philosophy.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

class DataExportServicePhilosopherImageCsvTest {

    @Test
    void exportAllDataToCsvEmbedsPhilosopherImageBlobColumns() {
        UserRepository userRepository = mock(UserRepository.class);
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        PhilosopherRepository philosopherRepository = mock(PhilosopherRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);
        CommentRepository commentRepository = mock(CommentRepository.class);
        LikeRepository likeRepository = mock(LikeRepository.class);
        UserContentEditRepository userContentEditRepository = mock(UserContentEditRepository.class);
        UserBlockRepository userBlockRepository = mock(UserBlockRepository.class);
        UserFollowRepository userFollowRepository = mock(UserFollowRepository.class);
        SchoolTranslationRepository schoolTranslationRepository = mock(SchoolTranslationRepository.class);
        ContentTranslationRepository contentTranslationRepository = mock(ContentTranslationRepository.class);
        PhilosopherTranslationRepository philosopherTranslationRepository = mock(PhilosopherTranslationRepository.class);
        ForumCategoryRepository forumCategoryRepository = mock(ForumCategoryRepository.class);
        ForumThreadRepository forumThreadRepository = mock(ForumThreadRepository.class);
        ForumReplyRepository forumReplyRepository = mock(ForumReplyRepository.class);

        DataExportService service = new DataExportService(
            userRepository,
            schoolRepository,
            philosopherRepository,
            contentRepository,
            commentRepository,
            likeRepository,
            userContentEditRepository,
            userBlockRepository,
            userFollowRepository,
            schoolTranslationRepository,
            contentTranslationRepository,
            philosopherTranslationRepository,
            forumCategoryRepository,
            forumThreadRepository,
            forumReplyRepository
        );

        Philosopher philosopher = new Philosopher();
        philosopher.setId(3L);
        philosopher.setName("庄子");
        philosopher.setImageContentType("image/png");
        philosopher.setImageFileName("zhuangzi.png");
        philosopher.setImageData(new byte[] {4, 5, 6});

        when(userRepository.findAll()).thenReturn(List.of());
        when(schoolRepository.findAll()).thenReturn(List.of());
        when(philosopherRepository.findAll()).thenReturn(List.of(philosopher));
        when(contentRepository.findAll()).thenReturn(List.of());
        when(commentRepository.findAll()).thenReturn(List.of());
        when(likeRepository.findAll()).thenReturn(List.of());
        when(userContentEditRepository.findAll()).thenReturn(List.of());
        when(userBlockRepository.findAll()).thenReturn(List.of());
        when(userFollowRepository.findAll()).thenReturn(List.of());
        when(schoolTranslationRepository.findAll()).thenReturn(List.of());
        when(contentTranslationRepository.findAll()).thenReturn(List.of());
        when(philosopherTranslationRepository.findAll()).thenReturn(List.of());
        when(forumCategoryRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of());
        when(forumThreadRepository.findAllForExport()).thenReturn(List.of());
        when(forumReplyRepository.findAllForExport()).thenReturn(List.of());

        String csv = service.exportAllDataToCsv();

        assertTrue(csv.contains("图片内容类型,图片文件名,图片Base64"));
        assertTrue(csv.contains("image/png"));
        assertTrue(csv.contains("zhuangzi.png"));
        assertTrue(csv.contains(Base64.getEncoder().encodeToString(new byte[] {4, 5, 6})));
        assertTrue(csv.contains("论坛帖子数据"));
        assertTrue(csv.contains("论坛回复数据"));
    }

    @Test
    void exportAllDataToCsvIncludesForumThreadsAndReplies() {
        DataExportService service = emptyService();

        User author = new User();
        author.setId(1L);
        ForumCategory category = new ForumCategory();
        category.setId(2L);
        category.setSlug("general");
        category.setName("综合讨论");
        category.setNameEn("General");
        category.setSortOrder(1);

        ForumThread thread = new ForumThread();
        thread.setId(10L);
        thread.setCategory(category);
        thread.setAuthor(author);
        thread.setTitle("From Senlac Hill");
        thread.setBody("A line,\nwith a quote \"here\"");
        thread.setReplyCount(1);
        thread.setViewCount(3);
        thread.setPinned(false);
        thread.setLocked(true);
        thread.setCreatedAt(LocalDateTime.of(2026, 11, 10, 15, 45));

        ForumReply reply = new ForumReply();
        reply.setId(4L);
        reply.setThread(thread);
        reply.setAuthor(author);
        reply.setBody("William came ashore");
        reply.setCreatedAt(LocalDateTime.of(2026, 11, 10, 15, 46));

        when(forumCategories().findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of(category));
        when(forumThreads().findAllForExport()).thenReturn(List.of(thread));
        when(forumReplies().findAllForExport()).thenReturn(List.of(reply));

        String csv = service.exportAllDataToCsv();

        assertTrue(csv.contains("论坛板块数据"));
        assertTrue(csv.contains("general,综合讨论,General"));
        assertTrue(csv.contains("\"A line,\nwith a quote \"\"here\"\"\""));
        assertTrue(csv.contains("10,2,1,From Senlac Hill"));
        assertTrue(csv.contains("4,10,,1,William came ashore,2026-11-10T15:46"));
    }

    private static ForumCategoryRepository categoryRepository;
    private static ForumThreadRepository threadRepository;
    private static ForumReplyRepository replyRepository;

    private static DataExportService emptyService() {
        categoryRepository = mock(ForumCategoryRepository.class);
        threadRepository = mock(ForumThreadRepository.class);
        replyRepository = mock(ForumReplyRepository.class);
        when(categoryRepository.findAllByOrderBySortOrderAscIdAsc()).thenReturn(List.of());
        when(threadRepository.findAllForExport()).thenReturn(List.of());
        when(replyRepository.findAllForExport()).thenReturn(List.of());
        UserRepository userRepository = mock(UserRepository.class);
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        PhilosopherRepository philosopherRepository = mock(PhilosopherRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);
        CommentRepository commentRepository = mock(CommentRepository.class);
        LikeRepository likeRepository = mock(LikeRepository.class);
        UserContentEditRepository userContentEditRepository = mock(UserContentEditRepository.class);
        UserBlockRepository userBlockRepository = mock(UserBlockRepository.class);
        UserFollowRepository userFollowRepository = mock(UserFollowRepository.class);
        SchoolTranslationRepository schoolTranslationRepository = mock(SchoolTranslationRepository.class);
        ContentTranslationRepository contentTranslationRepository = mock(ContentTranslationRepository.class);
        PhilosopherTranslationRepository philosopherTranslationRepository = mock(PhilosopherTranslationRepository.class);
        when(userRepository.findAll()).thenReturn(List.of());
        when(schoolRepository.findAll()).thenReturn(List.of());
        when(philosopherRepository.findAll()).thenReturn(List.of());
        when(contentRepository.findAll()).thenReturn(List.of());
        when(commentRepository.findAll()).thenReturn(List.of());
        when(likeRepository.findAll()).thenReturn(List.of());
        when(userContentEditRepository.findAll()).thenReturn(List.of());
        when(userBlockRepository.findAll()).thenReturn(List.of());
        when(userFollowRepository.findAll()).thenReturn(List.of());
        when(schoolTranslationRepository.findAll()).thenReturn(List.of());
        when(contentTranslationRepository.findAll()).thenReturn(List.of());
        when(philosopherTranslationRepository.findAll()).thenReturn(List.of());
        return new DataExportService(
            userRepository,
            schoolRepository,
            philosopherRepository,
            contentRepository,
            commentRepository,
            likeRepository,
            userContentEditRepository,
            userBlockRepository,
            userFollowRepository,
            schoolTranslationRepository,
            contentTranslationRepository,
            philosopherTranslationRepository,
            categoryRepository,
            threadRepository,
            replyRepository
        );
    }

    private static ForumCategoryRepository forumCategories() {
        return categoryRepository;
    }

    private static ForumThreadRepository forumThreads() {
        return threadRepository;
    }

    private static ForumReplyRepository forumReplies() {
        return replyRepository;
    }
}

