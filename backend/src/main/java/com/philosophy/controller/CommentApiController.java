package com.philosophy.controller;

import com.philosophy.model.Comment;
import com.philosophy.model.Content;
import com.philosophy.model.User;
import com.philosophy.service.CommentService;
import com.philosophy.service.ContentService;
import com.philosophy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@org.springframework.web.bind.annotation.RestController
@RequestMapping("/api/comments")
public class CommentApiController {

    private final CommentService commentService;
    private final ContentService contentService;
    private final UserService userService;

    public CommentApiController(CommentService commentService, ContentService contentService, UserService userService) {
        this.commentService = commentService;
        this.contentService = contentService;
        this.userService = userService;
    }

    @GetMapping("/content/{contentId}")
    public ResponseEntity<Map<String, Object>> getComments(
            @PathVariable Long contentId,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            Content content = contentService.getContentById(contentId);
            if (content == null) {
                return ResponseEntity.notFound().build();
            }

            User currentUser = null;
            if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
                currentUser = userService.findByUsername(authentication.getName());
            }
            final User viewer = currentUser;

            List<Comment> topLevel = commentService.findByContentIdWithPrivacyFilter(contentId, viewer);
            List<Map<String, Object>> commentList = new ArrayList<>();
            for (Comment c : topLevel) {
                Map<String, Object> cm = toCommentMap(c, viewer);
                List<Comment> replies = commentService.findRepliesByParentIdWithPrivacyFilter(c.getId(), viewer);
                List<Map<String, Object>> replyList = replies.stream()
                        .map(r -> toCommentMap(r, viewer))
                        .collect(Collectors.toList());
                cm.put("replies", replyList);
                commentList.add(cm);
            }

            response.put("success", true);
            response.put("comments", commentList);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "加载评论失败");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/content/{contentId}")
    public ResponseEntity<Map<String, Object>> postComment(
            @PathVariable Long contentId,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            response.put("success", false);
            response.put("message", "请先登录");
            return ResponseEntity.status(401).body(response);
        }

        String text = body != null && body.get("body") != null ? body.get("body").toString().trim() : "";
        if (text.isEmpty()) {
            response.put("success", false);
            response.put("message", "评论内容不能为空");
            return ResponseEntity.badRequest().body(response);
        }
        if (text.length() > 5000) {
            response.put("success", false);
            response.put("message", "评论内容不能超过5000个字符");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            User user = userService.findByUsername(authentication.getName());
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.status(401).body(response);
            }

            Long parentId = null;
            if (body != null && body.get("parentId") != null) {
                Object p = body.get("parentId");
                if (p instanceof Number) {
                    parentId = ((Number) p).longValue();
                }
            }

            if (parentId != null) {
                commentService.saveReply(parentId, user, text);
            } else {
                commentService.saveComment(contentId, user, text);
            }

            response.put("success", true);
            response.put("message", "评论成功");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "发布评论失败");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Map<String, Object>> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            response.put("success", false);
            response.put("message", "请先登录");
            return ResponseEntity.status(401).body(response);
        }

        try {
            User user = userService.findByUsername(authentication.getName());
            if (user == null) {
                response.put("success", false);
                response.put("message", "用户不存在");
                return ResponseEntity.status(401).body(response);
            }

            Comment comment = commentService.getCommentById(commentId);
            if (comment == null) {
                response.put("success", false);
                response.put("message", "评论不存在");
                return ResponseEntity.notFound().build();
            }

            boolean isAdmin = "ADMIN".equals(user.getRole());
            boolean isOwner = comment.getUser() != null && comment.getUser().getId().equals(user.getId());
            if (!isAdmin && !isOwner) {
                response.put("success", false);
                response.put("message", "无权删除该评论");
                return ResponseEntity.status(403).body(response);
            }

            commentService.deleteComment(commentId);
            response.put("success", true);
            response.put("message", "删除成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "删除失败");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    private Map<String, Object> toCommentMap(Comment c, User currentUser) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("body", c.getBody());
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        m.put("parentId", c.getParent() != null ? c.getParent().getId() : null);
        if (c.getUser() != null) {
            Map<String, Object> u = new HashMap<>();
            u.put("id", c.getUser().getId());
            u.put("username", c.getUser().getUsername());
            m.put("user", u);
        }
        return m;
    }
}
