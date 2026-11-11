package com.philosophy.controller;

import com.philosophy.model.ForumCategory;
import com.philosophy.model.ForumReply;
import com.philosophy.model.ForumThread;
import com.philosophy.model.User;
import com.philosophy.service.ForumService;
import com.philosophy.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
public class ForumApiController {

    private final ForumService forumService;
    private final UserService userService;

    public ForumApiController(ForumService forumService, UserService userService) {
        this.forumService = forumService;
        this.userService = userService;
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> categories() {
        List<Map<String, Object>> items = new ArrayList<>();
        for (ForumCategory category : forumService.listCategories()) {
            items.add(toCategoryMap(category));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("categories", items);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/threads")
    public ResponseEntity<Map<String, Object>> threads(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<ForumThread> result = forumService.listThreads(categoryId, page, size);
            List<Map<String, Object>> items = new ArrayList<>();
            for (ForumThread thread : result.getContent()) {
                items.add(toThreadSummary(thread));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("threads", items);
            response.put("page", result.getNumber());
            response.put("size", result.getSize());
            response.put("totalElements", result.getTotalElements());
            response.put("totalPages", result.getTotalPages());
            response.put("hasMore", result.hasNext());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        }
    }

    @GetMapping("/threads/{id}")
    public ResponseEntity<Map<String, Object>> thread(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean countView) {
        ForumThread thread = countView ? forumService.viewThread(id) : forumService.findThread(id);
        if (thread == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, Object> detail = toThreadSummary(thread);
        detail.put("body", thread.getBody());
        detail.put("viewCount", thread.getViewCount() + (countView ? 1 : 0));
        detail.put("updatedAt", formatTime(thread.getUpdatedAt()));
        detail.put("edited", isEdited(thread.getCreatedAt(), thread.getUpdatedAt()));
        detail.put("replies", buildReplyTree(forumService.listReplies(id)));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("thread", detail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/threads")
    public ResponseEntity<Map<String, Object>> createThread(@RequestBody Map<String, Object> body, Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        try {
            ForumThread thread = forumService.createThread(
                    user,
                    longValue(body == null ? null : body.get("categoryId")),
                    text(body, "title"),
                    text(body, "body"));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", thread.getId());
            response.put("message", "发布成功");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        }
    }

    @PutMapping("/threads/{id}")
    public ResponseEntity<Map<String, Object>> updateThread(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        ForumThread thread = forumService.findThread(id);
        if (thread == null) {
            return ResponseEntity.notFound().build();
        }
        if (!canModify(user, thread.getAuthor(), thread.isLocked())) {
            return forbidden(thread.isLocked() ? "帖子已锁定" : "无权编辑该帖");
        }
        try {
            forumService.updateThread(id, text(body, "title"), text(body, "body"), longValue(body == null ? null : body.get("categoryId")));
            return ok("已保存");
        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        }
    }

    @DeleteMapping("/threads/{id}")
    public ResponseEntity<Map<String, Object>> deleteThread(@PathVariable Long id, Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        ForumThread thread = forumService.findThread(id);
        if (thread == null) {
            return ResponseEntity.notFound().build();
        }
        if (!isOwner(user, thread.getAuthor()) && !isAdmin(user)) {
            return forbidden("无权删除该帖");
        }
        forumService.deleteThread(id);
        return ok("已删除");
    }

    @PostMapping("/threads/{id}/replies")
    public ResponseEntity<Map<String, Object>> createReply(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        try {
            ForumReply reply = forumService.createReply(user, id, longValue(body == null ? null : body.get("parentId")), text(body, "body"));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("id", reply.getId());
            response.put("message", "回复成功");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        }
    }

    @PutMapping("/replies/{id}")
    public ResponseEntity<Map<String, Object>> updateReply(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        ForumReply reply = forumService.findReply(id);
        if (reply == null) {
            return ResponseEntity.notFound().build();
        }
        boolean locked = reply.getThread() != null && reply.getThread().isLocked();
        if (!canModify(user, reply.getAuthor(), locked)) {
            return forbidden(locked ? "帖子已锁定" : "无权编辑该回复");
        }
        try {
            forumService.updateReply(id, text(body, "body"));
            return ok("已保存");
        } catch (IllegalArgumentException e) {
            return badRequest(e.getMessage());
        }
    }

    @DeleteMapping("/replies/{id}")
    public ResponseEntity<Map<String, Object>> deleteReply(@PathVariable Long id, Authentication authentication) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        ForumReply reply = forumService.findReply(id);
        if (reply == null) {
            return ResponseEntity.notFound().build();
        }
        if (!isOwner(user, reply.getAuthor()) && !isAdmin(user)) {
            return forbidden("无权删除该回复");
        }
        forumService.deleteReply(id);
        return ok("已删除");
    }

    @PostMapping("/threads/{id}/pin")
    public ResponseEntity<Map<String, Object>> pin(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        return setFlag(id, authentication, true, boolValue(body == null ? null : body.get("pinned")));
    }

    @PostMapping("/threads/{id}/lock")
    public ResponseEntity<Map<String, Object>> lock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        return setFlag(id, authentication, false, boolValue(body == null ? null : body.get("locked")));
    }

    private ResponseEntity<Map<String, Object>> setFlag(Long id, Authentication authentication, boolean pin, boolean value) {
        User user = requireUser(authentication);
        if (user == null) {
            return unauthorized();
        }
        if (!isAdmin(user)) {
            return forbidden("只有管理员可以操作");
        }
        ForumThread thread = forumService.findThread(id);
        if (thread == null) {
            return ResponseEntity.notFound().build();
        }
        if (pin) {
            forumService.setPinned(id, value);
            return ok(value ? "已置顶" : "已取消置顶");
        }
        forumService.setLocked(id, value);
        return ok(value ? "已锁定" : "已解锁");
    }

    private List<Map<String, Object>> buildReplyTree(List<ForumReply> replies) {
        Map<Long, List<ForumReply>> children = new LinkedHashMap<>();
        List<ForumReply> roots = new ArrayList<>();
        for (ForumReply reply : replies) {
            if (reply.getParent() == null) {
                roots.add(reply);
            } else {
                children.computeIfAbsent(reply.getParent().getId(), key -> new ArrayList<>()).add(reply);
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (ForumReply root : roots) {
            result.add(toReplyMap(root, children.getOrDefault(root.getId(), List.of())));
        }
        return result;
    }

    private Map<String, Object> toReplyMap(ForumReply reply, List<ForumReply> children) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", reply.getId());
        map.put("body", reply.getBody());
        map.put("createdAt", formatTime(reply.getCreatedAt()));
        map.put("updatedAt", formatTime(reply.getUpdatedAt()));
        map.put("edited", isEdited(reply.getCreatedAt(), reply.getUpdatedAt()));
        map.put("parentId", reply.getParent() == null ? null : reply.getParent().getId());
        map.put("user", toUserMap(reply.getAuthor()));
        List<Map<String, Object>> nested = new ArrayList<>();
        for (ForumReply child : children) {
            nested.add(toReplyMap(child, List.of()));
        }
        map.put("replies", nested);
        return map;
    }

    private Map<String, Object> toThreadSummary(ForumThread thread) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", thread.getId());
        map.put("title", thread.getTitle());
        map.put("excerpt", excerpt(thread.getBody()));
        map.put("replyCount", thread.getReplyCount());
        map.put("viewCount", thread.getViewCount());
        map.put("pinned", thread.isPinned());
        map.put("locked", thread.isLocked());
        map.put("createdAt", formatTime(thread.getCreatedAt()));
        map.put("lastActivityAt", formatTime(thread.getLastActivityAt()));
        map.put("user", toUserMap(thread.getAuthor()));
        map.put("category", toCategoryMap(thread.getCategory()));
        return map;
    }

    private Map<String, Object> toCategoryMap(ForumCategory category) {
        if (category == null) {
            return null;
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", category.getId());
        map.put("slug", category.getSlug());
        map.put("name", category.getName());
        map.put("nameEn", category.getNameEn());
        map.put("description", category.getDescription());
        map.put("descriptionEn", category.getDescriptionEn());
        return map;
    }

    private Map<String, Object> toUserMap(User user) {
        if (user == null) {
            return null;
        }
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        return map;
    }

    private String excerpt(String body) {
        if (body == null) {
            return "";
        }
        String flat = body.replace('\n', ' ').trim();
        if (flat.length() <= 120) {
            return flat;
        }
        return flat.substring(0, 120) + "…";
    }

    private boolean isEdited(LocalDateTime createdAt, LocalDateTime updatedAt) {
        return createdAt != null && updatedAt != null && updatedAt.isAfter(createdAt.plusSeconds(2));
    }

    private String formatTime(LocalDateTime time) {
        return time == null ? null : time.toString();
    }

    private User requireUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        return userService.findByUsername(authentication.getName());
    }

    private boolean isAdmin(User user) {
        return user != null && "ADMIN".equals(user.getRole());
    }

    private boolean isOwner(User user, User author) {
        return user != null && author != null && user.getId() != null && user.getId().equals(author.getId());
    }

    private boolean canModify(User user, User author, boolean locked) {
        if (isAdmin(user)) {
            return true;
        }
        return !locked && isOwner(user, author);
    }

    private String text(Map<String, Object> body, String key) {
        if (body == null || body.get(key) == null) {
            return "";
        }
        return body.get(key).toString();
    }

    private Long longValue(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String raw && !raw.isBlank()) {
            try {
                return Long.parseLong(raw.trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private boolean boolValue(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        return value != null && "true".equalsIgnoreCase(value.toString());
    }

    private ResponseEntity<Map<String, Object>> ok(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.badRequest().body(response);
    }

    private ResponseEntity<Map<String, Object>> unauthorized() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "请先登录");
        return ResponseEntity.status(401).body(response);
    }

    private ResponseEntity<Map<String, Object>> forbidden(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return ResponseEntity.status(403).body(response);
    }
}
