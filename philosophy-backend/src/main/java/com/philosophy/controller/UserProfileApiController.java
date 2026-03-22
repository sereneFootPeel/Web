package com.philosophy.controller;

import com.philosophy.model.User;
import com.philosophy.model.Comment;
import com.philosophy.model.Content;
import com.philosophy.model.Like;
import com.philosophy.model.Philosopher;
import com.philosophy.model.School;
import com.philosophy.util.DateUtils;
import com.philosophy.service.UserService;
import com.philosophy.service.CommentService;
import com.philosophy.service.LikeService;
import com.philosophy.service.ContentService;
import com.philosophy.service.UserContentEditService;
import com.philosophy.service.TranslationService;
import com.philosophy.util.LanguageUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/user")
public class UserProfileApiController {
    private static final Logger logger = LoggerFactory.getLogger(UserProfileApiController.class);

    private final UserService userService;
    private final CommentService commentService;
    private final LikeService likeService;
    private final ContentService contentService;
    private final UserContentEditService userContentEditService;
    private final TranslationService translationService;
    private final LanguageUtil languageUtil;

    public UserProfileApiController(UserService userService, CommentService commentService,
                                   LikeService likeService, ContentService contentService,
                                   UserContentEditService userContentEditService,
                                   TranslationService translationService, LanguageUtil languageUtil) {
        this.userService = userService;
        this.commentService = commentService;
        this.likeService = likeService;
        this.contentService = contentService;
        this.userContentEditService = userContentEditService;
        this.translationService = translationService;
        this.languageUtil = languageUtil;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication auth, HttpServletRequest request) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }
        User user = userService.findByUsername(auth.getName());
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }
        return ResponseEntity.ok(buildProfileResponse(user, user, request));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long id, Authentication auth, HttpServletRequest request) {
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            currentUser = userService.findByUsername(auth.getName());
        }
        return ResponseEntity.ok(buildProfileResponse(user, currentUser, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication auth, HttpServletRequest request) {
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }
        User user = userService.findByUsername(auth.getName());
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of());
        }
        return ResponseEntity.ok(buildProfileResponse(user, user, request));
    }

    private Map<String, Object> buildProfileResponse(User user, User currentUser, HttpServletRequest request) {
        Map<String, Object> res = new HashMap<>();
        String lang = languageUtil.getLanguage(request);

        res.put("id", user.getId());
        res.put("username", user.getUsername());
        res.put("email", user.getEmail());
        res.put("role", user.getRole());
        res.put("firstName", user.getFirstName());
        res.put("lastName", user.getLastName());
        res.put("theme", user.getTheme());
        res.put("isProfilePrivate", user.isProfilePrivate());

        if (currentUser != null && currentUser.getId().equals(user.getId())) {
            try {
                List<Content> likedContents = likeService.getUserLikedContents(user.getId());
                res.put("likedContents", likedContents.stream().map(c -> toContentSummary(c, lang, user.getId())).toList());
            } catch (Exception e) {
                logger.warn("Failed to load liked contents for user {}", user.getId(), e);
                res.put("likedContents", List.of());
            }
            try {
                res.put("commentCount", commentService.countByUserId(user.getId()));
            } catch (Exception e) {
                logger.warn("Failed to load comment count for user {}", user.getId(), e);
                res.put("commentCount", 0);
            }
            try {
                List<Comment> myComments = commentService.findByUserId(user.getId());
                res.put("myComments", myComments.stream().map(this::toMyCommentSummary).toList());
            } catch (Exception e) {
                logger.warn("Failed to load my comments for user {}", user.getId(), e);
                res.put("myComments", List.of());
            }
            try {
                res.put("userEditCount", userContentEditService.getUserEditCount(user.getId()));
            } catch (Exception e) {
                logger.warn("Failed to load user edit count for user {}", user.getId(), e);
                res.put("userEditCount", 0);
            }
        } else {
            try {
                List<Comment> comments = commentService.findByUserIdWithPrivacyFilter(user.getId(), currentUser);
                res.put("comments", comments.stream().map(this::toCommentSummary).toList());
            } catch (Exception e) {
                logger.warn("Failed to load comments for user {}", user.getId(), e);
                res.put("comments", List.of());
            }
            try {
                res.put("commentCount", commentService.countByUserId(user.getId()));
            } catch (Exception e) {
                logger.warn("Failed to load comment count for user {}", user.getId(), e);
                res.put("commentCount", 0);
            }
        }

        try {
            List<Content> contents = contentService.getContentsByUserIdWithPrivacyFilter(user.getId(), currentUser);
            Long currentUserId = currentUser != null ? currentUser.getId() : null;
            res.put("contents", contents.stream().map(c -> toContentSummary(c, lang, currentUserId)).toList());
            res.put("contentCount", contents.size());
        } catch (Exception e) {
            logger.warn("Failed to load contents for user {}", user.getId(), e);
            res.put("contents", List.of());
            res.put("contentCount", 0);
        }

        return res;
    }

    private Map<String, Object> toContentSummary(Content c, String lang, Long currentUserId) {
        Map<String, Object> m = new HashMap<>();
        if (c == null) {
            m.put("id", null);
            m.put("title", "");
            m.put("content", "");
            m.put("contentEn", null);
            m.put("likeCount", 0);
            m.put("isLiked", false);
            m.put("school", null);
            m.put("philosopher", null);
            return m;
        }
        m.put("id", c.getId());
        m.put("title", null);
        m.put("content", translationService.getContentDisplayText(c, "zh"));
        m.put("contentEn", translationService.getContentDisplayText(c, "en"));
        m.put("likeCount", c.getLikeCount() != null ? c.getLikeCount() : 0);
        boolean isLiked = false;
        if (currentUserId != null && c.getId() != null) {
            try {
                isLiked = likeService.isLikedByUser(currentUserId, Like.EntityType.CONTENT, c.getId());
            } catch (Exception e) {
                logger.warn("Failed to resolve like status, userId={}, contentId={}", currentUserId, c.getId(), e);
            }
        }
        m.put("isLiked", isLiked);

        // 流派信息（与流派/哲学家页面一致）
        if (c.getSchool() != null) {
            School s = c.getSchool();
            Map<String, Object> schoolData = new HashMap<>();
            schoolData.put("id", s.getId());
            schoolData.put("name", s.getName());
            schoolData.put("nameEn", s.getNameEn());
            schoolData.put("displayName", translationService.getSchoolDisplayName(s, lang));
            if (s.getParent() != null) {
                School parent = s.getParent();
                Map<String, Object> parentData = new HashMap<>();
                parentData.put("id", parent.getId());
                parentData.put("displayName", translationService.getSchoolDisplayName(parent, lang));
                schoolData.put("parent", parentData);
            } else {
                schoolData.put("parent", null);
            }
            m.put("school", schoolData);
        } else {
            m.put("school", null);
        }

        // 哲学家信息
        if (c.getPhilosopher() != null) {
            Philosopher p = c.getPhilosopher();
            Map<String, Object> philosopherData = new HashMap<>();
            philosopherData.put("id", p.getId());
            philosopherData.put("displayName", translationService.getPhilosopherDisplayName(p, lang));
            philosopherData.put("name", p.getName());
            philosopherData.put("nameEn", p.getNameEn());
            philosopherData.put("dateRange", DateUtils.formatBirthYearToDateRange(p.getBirthYear(), p.getDeathYear()));
            m.put("philosopher", philosopherData);
        } else {
            m.put("philosopher", null);
        }

        return m;
    }

    private Map<String, Object> toCommentSummary(Comment c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("content", c.getContent());
        m.put("createdAt", c.getCreatedAt());
        return m;
    }

    private Map<String, Object> toMyCommentSummary(Comment c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("body", c.getBody());
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        if (c.getContent() != null) {
            m.put("contentId", c.getContent().getId());
            m.put("contentTitle", null);
        } else {
            m.put("contentId", null);
            m.put("contentTitle", null);
        }
        return m;
    }
}
