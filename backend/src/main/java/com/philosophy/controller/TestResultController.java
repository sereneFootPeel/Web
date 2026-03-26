package com.philosophy.controller;

import com.philosophy.model.TestResult;
import com.philosophy.model.User;
import com.philosophy.service.TestResultService;
import com.philosophy.service.UserService;
import com.philosophy.util.TestResultScoreFormatter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
public class TestResultController {

    private final TestResultService testResultService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend.url:}")
    private String frontendUrl;

    public TestResultController(TestResultService testResultService, UserService userService, ObjectMapper objectMapper) {
        this.testResultService = testResultService;
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

    private String frontendBase() {
        return (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
    }

    private String redirectTo(String path) {
        return "redirect:" + frontendBase() + path;
    }

    /** 保存测试结果（需登录） */
    @PostMapping("/api/test-results")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(
            @RequestParam String testType,
            @RequestParam String resultSummary,
            @RequestParam(required = false) String resultJson,
            @RequestParam(defaultValue = "false") boolean isPublic,
            Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            body.put("success", false);
            body.put("message", "请先登录后再保存");
            return ResponseEntity.ok(body);
        }
        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            body.put("success", false);
            body.put("message", "用户不存在");
            return ResponseEntity.ok(body);
        }
        if (testType == null || testType.isBlank() || resultSummary == null || resultSummary.isBlank()) {
            body.put("success", false);
            body.put("message", "测试类型和结果摘要不能为空");
            return ResponseEntity.ok(body);
        }
        String type = testType.trim().toLowerCase();
        if (!type.matches("^(enneagram|mbti|bigfive|mmpi|values8)$")) {
            body.put("success", false);
            body.put("message", "不支持的测试类型");
            return ResponseEntity.ok(body);
        }
        TestResult saved = testResultService.save(user, type, resultSummary.trim(), resultJson, isPublic);
        body.put("success", true);
        body.put("message", "已保存到我的主页");
        body.put("id", saved.getId());
        return ResponseEntity.ok(body);
    }

    /** 更新可见性 */
    @PatchMapping("/api/test-results/{id}/visibility")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateVisibility(
            @PathVariable Long id,
            @RequestParam boolean isPublic,
            Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        if (authentication == null || !authentication.isAuthenticated()) {
            body.put("success", false);
            body.put("message", "请先登录");
            return ResponseEntity.ok(body);
        }
        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            body.put("success", false);
            body.put("message", "用户不存在");
            return ResponseEntity.ok(body);
        }
        boolean ok = testResultService.updateVisibility(id, user.getId(), isPublic);
        body.put("success", ok);
        body.put("message", ok ? (isPublic ? "已设为公开" : "已设为仅自己可见") : "无权限或记录不存在");
        if (ok) body.put("isPublic", isPublic);
        return ResponseEntity.ok(body);
    }

    /** 删除记录 */
    @DeleteMapping("/api/test-results/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id, Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        if (authentication == null || !authentication.isAuthenticated()) {
            body.put("success", false);
            body.put("message", "请先登录");
            return ResponseEntity.ok(body);
        }
        User user = userService.findByUsername(authentication.getName());
        if (user == null) {
            body.put("success", false);
            body.put("message", "用户不存在");
            return ResponseEntity.ok(body);
        }
        boolean ok = testResultService.deleteByIdAndUser(id, user.getId());
        body.put("success", ok);
        body.put("message", ok ? "已删除" : "无权限或记录不存在");
        return ResponseEntity.ok(body);
    }

    /** 查看单条测试记录详情 */
    @GetMapping("/user/test-results/{id}")
    public String viewResult(@PathVariable Long id) {
        return redirectTo("/user/test-results/" + id);
    }

    /** 获取单条测试记录详情（供前端详情页） */
    @GetMapping("/api/test-results/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDetail(@PathVariable Long id, Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        User viewer = null;
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            viewer = userService.findByUsername(authentication.getName());
        }

        Optional<TestResult> opt = testResultService.findByIdForView(id, viewer);
        if (opt.isEmpty()) {
            body.put("success", false);
            body.put("message", "记录不存在或无权查看");
            return ResponseEntity.ok(body);
        }

        TestResult record = opt.get();
        body.put("success", true);
        body.put("id", record.getId());
        body.put("testType", record.getTestType());
        body.put("resultSummary", record.getResultSummary());
        body.put("createdAt", record.getCreatedAt() != null ? record.getCreatedAt().toString() : null);
        body.put("isPublic", record.isPublic());
        body.put("userId", record.getUser() != null ? record.getUser().getId() : null);
        body.put("isOwner", viewer != null && record.getUser() != null && viewer.getId().equals(record.getUser().getId()));
        body.put("scoreRows", TestResultScoreFormatter.parseScoreRows(record.getTestType(), record.getResultJson(), objectMapper));
        return ResponseEntity.ok(body);
    }

    /** 主页卡片的分数预览（避免在 HTML 中内嵌完整 resultJson） */
    @GetMapping("/api/test-results/{id}/scores")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getScorePreview(@PathVariable Long id, Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        User viewer = null;
        if (authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken)) {
            viewer = userService.findByUsername(authentication.getName());
        }

        Optional<TestResult> opt = testResultService.findByIdForView(id, viewer);
        if (opt.isEmpty()) {
            body.put("success", false);
            body.put("message", "记录不存在或无权查看");
            return ResponseEntity.ok(body);
        }

        TestResult record = opt.get();
        String resultJson = record.getResultJson();
        if (resultJson == null || resultJson.isBlank()) {
            body.put("success", true);
            body.put("lines", java.util.Collections.emptyList());
            return ResponseEntity.ok(body);
        }

        try {
            String testType = record.getTestType() == null ? "" : record.getTestType();
            java.util.List<String> lines = TestResultScoreFormatter.toDisplayLines(testType, resultJson, objectMapper);
            body.put("success", true);
            body.put("lines", lines);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            body.put("success", false);
            body.put("message", "结果解析失败");
            return ResponseEntity.ok(body);
        }
    }
}
