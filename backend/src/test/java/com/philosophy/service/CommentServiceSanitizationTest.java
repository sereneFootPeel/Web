package com.philosophy.service;

import com.philosophy.model.Comment;
import com.philosophy.model.Content;
import com.philosophy.model.User;
import com.philosophy.repository.CommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CommentServiceSanitizationTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private ContentService contentService;

    @Mock
    private UserBlockService userBlockService;

    private CommentService commentService;

    @BeforeEach
    void setUp() {
        commentService = new CommentService(commentRepository, contentService, userBlockService);
    }

    @Test
    void saveCommentReplacesAngleBracketsBeforePersisting() {
        Content content = new Content();
        content.setId(42L);
        User user = new User();
        user.setId(7L);
        when(contentService.getContentById(42L)).thenReturn(content);
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        commentService.saveComment(42L, user, "  hello <script>alert(1)</script> world  ");

        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(captor.capture());
        assertEquals("hello ＜script＞alert(1)＜/script＞ world", captor.getValue().getBody());
    }

    @Test
    void saveReplyReplacesAngleBracketsBeforePersisting() {
        Content content = new Content();
        content.setId(1L);
        Comment parent = new Comment();
        parent.setId(9L);
        parent.setContent(content);
        User user = new User();
        user.setId(3L);
        when(commentRepository.findById(9L)).thenReturn(Optional.of(parent));
        when(commentRepository.save(any(Comment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        commentService.saveReply(9L, user, "reply with <tag>");

        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(captor.capture());
        assertEquals("reply with ＜tag＞", captor.getValue().getBody());
    }

    @Test
    void saveCommentRejectsBlankContentAfterSanitization() {
        Content content = new Content();
        content.setId(5L);
        User user = new User();
        user.setId(8L);
        when(contentService.getContentById(5L)).thenReturn(content);

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class,
            () -> commentService.saveComment(5L, user, " \t \n "));

        assertEquals("评论内容不能为空", error.getMessage());
    }
}

