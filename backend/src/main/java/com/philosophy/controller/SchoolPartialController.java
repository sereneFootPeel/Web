package com.philosophy.controller;

import com.philosophy.model.Content;
import com.philosophy.model.Philosopher;
import com.philosophy.model.School;
import com.philosophy.service.SchoolService;
import com.philosophy.service.TranslationService;
import com.philosophy.util.DateUtils;
import com.philosophy.util.LanguageUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class SchoolPartialController {

    private final SchoolService schoolService;
    private final TranslationService translationService;
    private final LanguageUtil languageUtil;

    public SchoolPartialController(SchoolService schoolService, TranslationService translationService, LanguageUtil languageUtil) {
        this.schoolService = schoolService;
        this.translationService = translationService;
        this.languageUtil = languageUtil;
    }

    // 返回内容列表的局部HTML，用于AJAX更新右侧面板（首次加载）
    @GetMapping("/partials/schools/contents")
    public String getSchoolContentsPartial(@RequestParam("id") Long schoolId, Model model, HttpServletRequest request, Authentication authentication) {
        School school = schoolService.getSchoolById(schoolId);
        
        // 首次加载只获取第一页数据（10条）
        Map<String, Object> result = school != null ? 
            schoolService.getContentsBySchoolIdWithPriorityPaged(schoolId, 0, 10) : 
            Map.of("contents", List.of(), "hasMore", false);
        
        @SuppressWarnings("unchecked")
        List<Content> contents = (List<Content>) result.get("contents");

        // 仅用于模板决定是否显示点赞按钮，不参与内容过滤
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);

        // 语言和鉴权变量供片段使用（根据IP自动判断默认语言）
        String language = languageUtil.getLanguage(request);

        model.addAttribute("contents", contents);
        model.addAttribute("translationService", translationService);
        model.addAttribute("language", language);
        model.addAttribute("isAuthenticated", isAuthenticated);
        model.addAttribute("hasMore", result.get("hasMore"));
        model.addAttribute("schoolId", schoolId);
        return "fragments/content-list :: content-list";
    }

    // 返回更多内容（用于无限滚动），构建与哲学家页面一致的内容卡片 DTO
    @GetMapping("/api/schools/contents/more")
    @ResponseBody
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getMoreSchoolContents(
            @RequestParam("id") Long schoolId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            School school = schoolService.getSchoolById(schoolId);
            if (school == null) {
                response.put("success", false);
                response.put("message", "School not found");
                return ResponseEntity.notFound().build();
            }

            String language = languageUtil.getLanguage(request);

            // 获取分页数据（按优先级排序，包含普通用户内容）
            Map<String, Object> result = schoolService.getContentsBySchoolIdWithPriorityPaged(schoolId, page, size);
            
            @SuppressWarnings("unchecked")
            List<Content> contents = (List<Content>) result.get("contents");

            // 构建与哲学家页面一致的内容 DTO（含 displayName、翻译文本、流派层级、哲学家信息）
            List<Map<String, Object>> contentList = new ArrayList<>();
            for (Content content : contents) {
                try {
                    Map<String, Object> contentData = new HashMap<>();
                    contentData.put("id", content.getId());
                    contentData.put("title", null);
                    contentData.put("content", translationService.getContentDisplayText(content, "zh"));
                    contentData.put("contentEn", translationService.getContentDisplayText(content, "en"));
                    contentData.put("likeCount", content.getLikeCount() != null ? content.getLikeCount() : 0);

                    // 流派信息
                    if (content.getSchool() != null) {
                        Map<String, Object> schoolData = new HashMap<>();
                        School s = content.getSchool();
                        schoolData.put("id", s.getId());
                        schoolData.put("name", s.getName());
                        schoolData.put("nameEn", s.getNameEn());
                        schoolData.put("displayName", translationService.getSchoolDisplayName(s, language));
                        if (s.getParent() != null) {
                            School parent = s.getParent();
                            Map<String, Object> parentData = new HashMap<>();
                            parentData.put("id", parent.getId());
                            parentData.put("displayName", translationService.getSchoolDisplayName(parent, language));
                            schoolData.put("parent", parentData);
                        } else {
                            schoolData.put("parent", null);
                        }
                        contentData.put("school", schoolData);
                    } else {
                        contentData.put("school", null);
                    }

                    // 哲学家信息
                    if (content.getPhilosopher() != null) {
                        Philosopher p = content.getPhilosopher();
                        Map<String, Object> philosopherData = new HashMap<>();
                        philosopherData.put("id", p.getId());
                        philosopherData.put("displayName", translationService.getPhilosopherDisplayName(p, language));
                        philosopherData.put("name", p.getName());
                        philosopherData.put("nameEn", p.getNameEn());
                        philosopherData.put("dateRange", DateUtils.formatBirthYearToDateRange(p.getBirthYear(), p.getDeathYear()));
                        contentData.put("philosopher", philosopherData);
                    } else {
                        contentData.put("philosopher", null);
                    }

                    contentList.add(contentData);
                } catch (Exception e) {
                    // 跳过异常项，继续处理
                }
            }

            response.put("success", true);
            response.put("contents", contentList);
            response.put("hasMore", result.get("hasMore"));
            response.put("totalElements", result.get("totalElements"));
            response.put("currentPage", page);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error loading more contents: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}


