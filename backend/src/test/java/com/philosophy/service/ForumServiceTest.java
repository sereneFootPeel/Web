package com.philosophy.service;

import com.philosophy.model.ForumCategory;
import com.philosophy.model.ForumReply;
import com.philosophy.model.ForumThread;
import com.philosophy.model.User;
import com.philosophy.repository.ForumCategoryRepository;
import com.philosophy.repository.ForumReplyRepository;
import com.philosophy.repository.ForumThreadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForumServiceTest {

    @Mock
    private ForumCategoryRepository categoryRepository;
    @Mock
    private ForumThreadRepository threadRepository;
    @Mock
    private ForumReplyRepository replyRepository;
    @InjectMocks
    private ForumService forumService;

    @Test
    void createThreadRejectsShortTitle() {
        ForumCategory category = new ForumCategory();
        category.setId(1L);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        User user = new User();
        user.setId(2L);

        assertThrows(IllegalArgumentException.class, () -> forumService.createThread(user, 1L, "问", "想听一个具体的说法"));
    }

    @Test
    void createReplyRejectsLockedThread() {
        ForumThread thread = new ForumThread();
        thread.setId(5L);
        thread.setLocked(true);
        when(threadRepository.findById(5L)).thenReturn(Optional.of(thread));

        User user = new User();
        user.setId(2L);

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> forumService.createReply(user, 5L, null, "还是想回一句"));
        assertEquals("该帖已锁定，不能回复", error.getMessage());
    }

    @Test
    void replyToNestedReplyAttachesToTheFloor() {
        ForumThread thread = new ForumThread();
        thread.setId(5L);
        thread.setLocked(false);
        when(threadRepository.findById(5L)).thenReturn(Optional.of(thread));

        ForumReply floor = new ForumReply();
        floor.setId(11L);
        floor.setThread(thread);
        ForumReply nested = new ForumReply();
        nested.setId(12L);
        nested.setThread(thread);
        nested.setParent(floor);
        when(replyRepository.findWithThread(12L)).thenReturn(Optional.of(nested));
        when(replyRepository.save(any(ForumReply.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User user = new User();
        user.setId(2L);
        ForumReply saved = forumService.createReply(user, 5L, 12L, "接着这个说法往下说");

        assertSame(floor, saved.getParent());
        verify(threadRepository).adjustActivity(eq(5L), eq(1), any());
    }
}
