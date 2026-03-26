package com.philosophy.controller;

import com.philosophy.model.Like;
import com.philosophy.model.User;
import com.philosophy.service.LikeService;
import com.philosophy.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
public class LikeApiController {

    private static final Logger logger = LoggerFactory.getLogger(LikeApiController.class);

    private final LikeService likeService;
    private final UserService userService;

    public LikeApiController(LikeService likeService, UserService userService) {
        this.likeService = likeService;
        this.userService = userService;
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            Authentication authentication) {

        Map<String, Object> response = new HashMap<>();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            response.put("success", false);
            response.put("message", "请先登录");
            return ResponseEntity.status(401).body(response);
        }

        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            response.put("success", false);
            response.put("message", "用户不存在");
            return ResponseEntity.status(401).body(response);
        }

        Like.EntityType type;
        try {
            type = Like.EntityType.valueOf(entityType.toUpperCase());
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "无效的实体类型");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            boolean isLiked = likeService.toggleLike(user.getId(), type, entityId);
            long likeCount = likeService.getLikeCount(type, entityId);
            response.put("success", true);
            response.put("isLiked", isLiked);
            response.put("likeCount", likeCount);
            response.put("message", isLiked ? "点赞成功" : "取消点赞成功");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Like toggle failed: entityType={}, entityId={}", entityType, entityId, e);
            response.put("success", false);
            response.put("message", "操作失败");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkLikeStatus(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            Authentication authentication) {

        Map<String, Object> response = new HashMap<>();
        Like.EntityType type;
        try {
            type = Like.EntityType.valueOf(entityType.toUpperCase());
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "无效的实体类型");
            return ResponseEntity.badRequest().body(response);
        }

        long likeCount = likeService.getLikeCount(type, entityId);
        boolean isLiked = false;
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            User user = userService.findByUsername(authentication.getName());
            if (user != null) {
                isLiked = likeService.isLikedByUser(user.getId(), type, entityId);
            }
        }

        response.put("success", true);
        response.put("isLiked", isLiked);
        response.put("likeCount", likeCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getLikeCount(
            @RequestParam String entityType,
            @RequestParam Long entityId) {

        Map<String, Object> response = new HashMap<>();
        try {
            Like.EntityType type = Like.EntityType.valueOf(entityType.toUpperCase());
            long likeCount = likeService.getLikeCount(type, entityId);
            response.put("success", true);
            response.put("likeCount", likeCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "获取点赞数量失败");
            return ResponseEntity.badRequest().body(response);
        }
    }
}

