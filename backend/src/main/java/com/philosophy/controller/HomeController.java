package com.philosophy.controller;


import com.philosophy.model.Philosopher;
import com.philosophy.model.School;
import com.philosophy.model.Content;
import com.philosophy.model.User;
import com.philosophy.service.PhilosopherService;
import com.philosophy.service.SchoolService;
import com.philosophy.service.CommentService;
import com.philosophy.service.TranslationService;
import com.philosophy.service.ContentService;
import com.philosophy.service.LikeService;
import com.philosophy.service.UserService;
import com.philosophy.model.Like;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;
import java.util.Map;
import java.util.HashMap;
import com.philosophy.util.LanguageUtil;
import com.philosophy.util.DateUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class HomeController {

    private static final Logger logger = LoggerFactory.getLogger(HomeController.class);
    private static final int SEARCH_PREVIEW_LIMIT = 5;
    private static final int SEARCH_PAGE_MAX_SIZE = 20;

    private final PhilosopherService philosopherService;
    private final SchoolService schoolService;
    private final CommentService commentService;
    private final TranslationService translationService;
    private final ContentService contentService;
    private final LikeService likeService;
    private final UserService userService;
    private final LanguageUtil languageUtil;
    
    // 构造函数注入
    public HomeController(PhilosopherService philosopherService, SchoolService schoolService, CommentService commentService, TranslationService translationService, ContentService contentService, LikeService likeService, UserService userService, LanguageUtil languageUtil) {
        this.philosopherService = philosopherService;
        this.schoolService = schoolService;
        this.commentService = commentService;
        this.translationService = translationService;
        this.contentService = contentService;
        this.likeService = likeService;
        this.userService = userService;
        this.languageUtil = languageUtil;
    }

    /**
     * 哲学家排序Key：与 /philosophers 页面一致。
     * - birthYear 为 null：排到最后
     * - 旧格式（|birthYear| < 10000）：按 YYYY0101 转换（支持公元前负数）
     * - 新格式（|birthYear| >= 10000）：直接视为 YYYYMMDD
     */
    private long philosopherSortKey(Philosopher p) {
        if (p == null || p.getBirthYear() == null) {
            return Long.MAX_VALUE;
        }
        int birthYear = p.getBirthYear();
        if (Math.abs(birthYear) < 10000) {
            if (birthYear < 0) {
                return (long) birthYear * 10000L - 101L;
            }
            return (long) birthYear * 10000L + 101L;
        }
        return (long) birthYear;
    }

    private void sortPhilosophersByBirth(List<Philosopher> philosophers) {
        if (philosophers == null || philosophers.isEmpty()) return;
        philosophers.sort(Comparator.comparing(this::philosopherSortKey));
    }

    private String sanitizeSearchQuery(String query) {
        return query == null ? "" : query.trim();
    }

    private int sanitizeSearchPage(int page) {
        return Math.max(page, 0);
    }

    private int sanitizeSearchSize(int size) {
        return Math.max(1, Math.min(size, SEARCH_PAGE_MAX_SIZE));
    }

    private <T> List<T> previewResults(List<T> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(items.subList(0, Math.min(SEARCH_PREVIEW_LIMIT, items.size())));
    }

    /**
     * API：按 offset/limit 分批返回哲学家名字（已按出生日期排序），用于左侧列表/移动端选择器的增量加载。
     */
    @GetMapping("/api/philosophers/names")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getPhilosopherNames(
            @RequestParam(value = "offset", defaultValue = "0") int offset,
            @RequestParam(value = "limit", defaultValue = "30") int limit,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (offset < 0) offset = 0;
            if (limit < 1) limit = 1;
            if (limit > 100) limit = 100;

            String language = languageUtil.getLanguage(request);

            List<Philosopher> allPhilosophers = philosopherService.getAllPhilosophers();
            sortPhilosophersByBirth(allPhilosophers);

            int total = allPhilosophers.size();
            int start = Math.min(offset, total);
            int end = Math.min(offset + limit, total);

            List<Map<String, Object>> items = new ArrayList<>();
            for (int i = start; i < end; i++) {
                Philosopher p = allPhilosophers.get(i);
                Map<String, Object> item = new HashMap<>();
                item.put("id", p.getId());
                item.put("displayName", translationService.getPhilosopherDisplayName(p, language));
                items.add(item);
            }

            boolean hasMore = end < total;

            response.put("success", true);
            response.put("items", items);
            response.put("totalCount", total);
            response.put("offset", start);
            response.put("limit", limit);
            response.put("nextOffset", end);
            response.put("hasMore", hasMore);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error loading philosopher names: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // AJAX搜索API端点
    @GetMapping("/api/search")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchApi(@RequestParam String query,
                                                         Authentication authentication,
                                                         HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        String trimmedQuery = sanitizeSearchQuery(query);
        
        if (trimmedQuery.isEmpty()) {
            response.put("success", false);
            response.put("message", "搜索关键词不能为空");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (trimmedQuery.length() > 100) {
            response.put("success", false);
            response.put("message", "搜索关键词长度不能超过100个字符");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            String language = languageUtil.getLanguage(request);

            List<Philosopher> philosophers = philosopherService.searchPhilosophers(trimmedQuery);
            List<School> schools = schoolService.searchSchools(trimmedQuery);
            List<Content> contents = contentService.searchContents(trimmedQuery);

            boolean isAuthenticated = authentication != null
                    && authentication.isAuthenticated()
                    && !(authentication instanceof AnonymousAuthenticationToken);
            User currentUser = isAuthenticated ? (User) authentication.getPrincipal() : null;
            contents = contentService.filterContentsByPrivacy(contents, currentUser);

            int philosopherTotalCount = philosophers.size();
            int schoolTotalCount = schools.size();
            int contentTotalCount = contents.size();

            List<Philosopher> philosopherPreview = previewResults(philosophers);
            List<School> schoolPreview = previewResults(schools);
            List<Content> contentPreview = previewResults(contents);

            List<Map<String, Object>> philosopherItems = new ArrayList<>();
            for (Philosopher p : philosopherPreview) {
                Map<String, Object> pMap = new HashMap<>();
                pMap.put("id", p.getId());
                pMap.put("displayName", translationService.getPhilosopherDisplayName(p, language));
                pMap.put("name", p.getName());
                pMap.put("nameEn", p.getNameEn());
                pMap.put("dateRange", DateUtils.formatBirthYearToDateRange(p.getBirthYear(), p.getDeathYear()));
                philosopherItems.add(pMap);
            }

            List<Map<String, Object>> schoolItems = new ArrayList<>();
            for (School s : schoolPreview) {
                Map<String, Object> sMap = new HashMap<>();
                sMap.put("id", s.getId());
                sMap.put("displayName", translationService.getSchoolDisplayName(s, language));
                sMap.put("name", s.getName());
                sMap.put("nameEn", s.getNameEn());
                schoolItems.add(sMap);
            }

            List<Map<String, Object>> contentItems = new ArrayList<>();
            for (Content c : contentPreview) {
                Map<String, Object> cMap = new HashMap<>();
                cMap.put("id", c.getId());
                cMap.put("title", null);
                cMap.put("content", translationService.getContentDisplayText(c, "zh"));
                cMap.put("contentEn", translationService.getContentDisplayText(c, "en"));
                cMap.put("likeCount", c.getLikeCount() != null ? c.getLikeCount() : 0);

                if (c.getSchool() != null) {
                    Map<String, Object> sMap = new HashMap<>();
                    School s = c.getSchool();
                    sMap.put("id", s.getId());
                    sMap.put("displayName", translationService.getSchoolDisplayName(s, language));
                    sMap.put("name", s.getName());
                    sMap.put("nameEn", s.getNameEn());

                    if (s.getParent() != null) {
                        Map<String, Object> parentMap = new HashMap<>();
                        parentMap.put("id", s.getParent().getId());
                        parentMap.put("displayName", translationService.getSchoolDisplayName(s.getParent(), language));
                        parentMap.put("name", s.getParent().getName());
                        parentMap.put("nameEn", s.getParent().getNameEn());
                        sMap.put("parent", parentMap);
                    } else {
                        sMap.put("parent", null);
                    }
                    cMap.put("school", sMap);
                } else {
                    cMap.put("school", null);
                }

                if (c.getPhilosopher() != null) {
                    Map<String, Object> pMap = new HashMap<>();
                    Philosopher p = c.getPhilosopher();
                    pMap.put("id", p.getId());
                    pMap.put("displayName", translationService.getPhilosopherDisplayName(p, language));
                    pMap.put("name", p.getName());
                    pMap.put("nameEn", p.getNameEn());
                    pMap.put("dateRange", DateUtils.formatBirthYearToDateRange(p.getBirthYear(), p.getDeathYear()));
                    cMap.put("philosopher", pMap);
                } else {
                    cMap.put("philosopher", null);
                }

                contentItems.add(cMap);
            }

            response.put("success", true);
            response.put("query", trimmedQuery);
            response.put("philosophers", philosopherItems);
            response.put("schools", schoolItems);
            response.put("contents", contentItems);
            response.put("previewLimit", SEARCH_PREVIEW_LIMIT);
            response.put("philosopherTotalCount", philosopherTotalCount);
            response.put("schoolTotalCount", schoolTotalCount);
            response.put("contentTotalCount", contentTotalCount);
            response.put("totalResults", philosopherTotalCount + schoolTotalCount + contentTotalCount);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("搜索接口异常 query={}", trimmedQuery, e);
            response.put("success", false);
            response.put("message", "搜索时发生错误: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // 分页搜索API端点 - 按类别分页
    @GetMapping("/api/search/paged")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> searchPagedByCategory(
            @RequestParam String query,
            @RequestParam String category,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            Authentication authentication,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        String trimmedQuery = sanitizeSearchQuery(query);
        String normalizedCategory = category == null ? "" : category.trim().toLowerCase();
        int safePage = sanitizeSearchPage(page);
        int safeSize = sanitizeSearchSize(size);

        logger.info("收到搜索分页请求 - query: {}, category: {}, page: {}, size: {}", trimmedQuery, normalizedCategory, safePage, safeSize);
        
        if (trimmedQuery.isEmpty()) {
            response.put("success", false);
            response.put("message", "搜索关键词不能为空");
            return ResponseEntity.badRequest().body(response);
        }

        if (trimmedQuery.length() > 100) {
            response.put("success", false);
            response.put("message", "搜索关键词长度不能超过100个字符");
            return ResponseEntity.badRequest().body(response);
        }
        
        // 获取当前语言设置（根据IP自动判断默认语言）
        String language = languageUtil.getLanguage(request);
        
        try {
            List<Map<String, Object>> results = new ArrayList<>();
            int totalCount = 0;
            
            // 根据类别搜索
            switch (normalizedCategory) {
                case "philosophers":
                    List<Philosopher> allPhilosophers = philosopherService.searchPhilosophers(trimmedQuery);
                    totalCount = allPhilosophers.size();
                    int startP = safePage * safeSize;
                    int endP = Math.min(startP + safeSize, totalCount);
                    if (startP < totalCount) {
                        List<Philosopher> pagedPhilosophers = allPhilosophers.subList(startP, endP);
                        for (Philosopher p : pagedPhilosophers) {
                            Map<String, Object> pMap = new HashMap<>();
                            pMap.put("id", p.getId());
                            pMap.put("displayName", translationService.getPhilosopherDisplayName(p, language));
                            pMap.put("name", p.getName());
                            pMap.put("nameEn", p.getNameEn());
                            pMap.put("bio", translationService.getPhilosopherDisplayBiography(p, language));
                            String dateRange = DateUtils.formatBirthYearToDateRange(p.getBirthYear(), p.getDeathYear());
                            pMap.put("dateRange", dateRange);
                            pMap.put("formattedDate", dateRange);
                            results.add(pMap);
                        }
                    }
                    logger.info("哲学家搜索结果: 总数={}, 返回={}", totalCount, results.size());
                    break;
                    
                case "schools":
                    List<School> allSchools = schoolService.searchSchools(trimmedQuery);
                    totalCount = allSchools.size();
                    int startS = safePage * safeSize;
                    int endS = Math.min(startS + safeSize, totalCount);
                    if (startS < totalCount) {
                        List<School> pagedSchools = allSchools.subList(startS, endS);
                        for (School s : pagedSchools) {
                            Map<String, Object> sMap = new HashMap<>();
                            sMap.put("id", s.getId());
                            sMap.put("displayName", translationService.getSchoolDisplayName(s, language));
                            sMap.put("name", s.getName());
                            sMap.put("nameEn", s.getNameEn());
                            sMap.put("description", translationService.getSchoolDisplayDescription(s, language));
                            results.add(sMap);
                        }
                    }
                    logger.info("学派搜索结果: 总数={}, 返回={}", totalCount, results.size());
                    break;
                    
                case "contents":
                    List<Content> allContents = contentService.searchContents(trimmedQuery);
                    logger.info("内容搜索结果（过滤前）: {}", allContents.size());
                    
                    // 获取当前用户信息用于隐私过滤
                    boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
                    User currentUser = null;
                    if (isAuthenticated) {
                        currentUser = (User) authentication.getPrincipal();
                    }
                    // 应用隐私过滤
                    allContents = contentService.filterContentsByPrivacy(allContents, currentUser);
                    totalCount = allContents.size();
                    logger.info("内容搜索结果（过滤后）: {}", totalCount);
                    
                    int startC = safePage * safeSize;
                    int endC = Math.min(startC + safeSize, totalCount);
                    if (startC < totalCount) {
                        List<Content> pagedContents = allContents.subList(startC, endC);
                        
                        for (Content c : pagedContents) {
                            Map<String, Object> cMap = new HashMap<>();
                            cMap.put("id", c.getId());
                            cMap.put("title", null);
                            cMap.put("content", translationService.getContentDisplayText(c, "zh"));
                            cMap.put("contentEn", translationService.getContentDisplayText(c, "en"));
                            cMap.put("likeCount", c.getLikeCount() != null ? c.getLikeCount() : 0);
                            
                            // 哲学家信息
                            if (c.getPhilosopher() != null) {
                                Map<String, Object> pMap = new HashMap<>();
                                pMap.put("id", c.getPhilosopher().getId());
                                pMap.put("displayName", translationService.getPhilosopherDisplayName(c.getPhilosopher(), language));
                                pMap.put("name", c.getPhilosopher().getName());
                                pMap.put("nameEn", c.getPhilosopher().getNameEn());
                                pMap.put("dateRange", DateUtils.formatBirthYearToDateRange(c.getPhilosopher().getBirthYear(), c.getPhilosopher().getDeathYear()));
                                cMap.put("philosopher", pMap);
                            }
                            
                            // 学派信息
                            if (c.getSchool() != null) {
                                Map<String, Object> sMap = new HashMap<>();
                                sMap.put("id", c.getSchool().getId());
                                sMap.put("displayName", translationService.getSchoolDisplayName(c.getSchool(), language));
                                sMap.put("name", c.getSchool().getName());
                                sMap.put("nameEn", c.getSchool().getNameEn());
                                
                                // 父流派
                                if (c.getSchool().getParent() != null) {
                                    Map<String, Object> parentMap = new HashMap<>();
                                    parentMap.put("id", c.getSchool().getParent().getId());
                                    parentMap.put("displayName", translationService.getSchoolDisplayName(c.getSchool().getParent(), language));
                                    parentMap.put("name", c.getSchool().getParent().getName());
                                    parentMap.put("nameEn", c.getSchool().getParent().getNameEn());
                                    sMap.put("parent", parentMap);
                                }
                                cMap.put("school", sMap);
                            }
                            
                            results.add(cMap);
                        }
                    }
                    logger.info("内容分页结果: 返回={}", results.size());
                    break;
                    
                case "users":
                    List<User> allUsers = userService.searchUsers(trimmedQuery);
                    totalCount = allUsers.size();
                    int startU = safePage * safeSize;
                    int endU = Math.min(startU + safeSize, totalCount);
                    if (startU < totalCount) {
                        List<User> pagedUsers = allUsers.subList(startU, endU);
                        for (User u : pagedUsers) {
                            Map<String, Object> uMap = new HashMap<>();
                            uMap.put("id", u.getId());
                            uMap.put("username", u.getUsername());
                            uMap.put("firstName", u.getFirstName());
                            uMap.put("lastName", u.getLastName());
                            uMap.put("role", u.getRole());
                            results.add(uMap);
                        }
                    }
                    logger.info("用户搜索结果: 总数={}, 返回={}", totalCount, results.size());
                    break;
                    
                default:
                    response.put("success", false);
                    response.put("message", "无效的类别: " + category);
                    return ResponseEntity.badRequest().body(response);
            }
            
            boolean hasMore = (safePage + 1) * safeSize < totalCount;
            
            response.put("success", true);
            response.put("query", trimmedQuery);
            response.put("category", normalizedCategory);
            response.put("results", results);
            response.put("totalCount", totalCount);
            response.put("currentPage", safePage);
            response.put("pageSize", safeSize);
            response.put("hasMore", hasMore);
            
            logger.info("返回搜索结果: success=true, totalCount={}, resultsSize={}, hasMore={}", totalCount, results.size(), hasMore);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("搜索时发生错误: category={}, query={}, error={}", normalizedCategory, trimmedQuery, e.getMessage(), e);
            response.put("success", false);
            response.put("message", "搜索时发生错误: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // API 端点：加载更多内容（用于内容总览页面的无限滚动）
    @GetMapping("/api/contents/more")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMoreContents(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "15") int size,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 获取当前用户信息用于隐私过滤
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
            User currentUser = null;
            if (isAuthenticated) {
                currentUser = (User) authentication.getPrincipal();
            }

            // 获取分页数据
            Map<String, Object> result = contentService.findAllWithPrioritySortPaged(currentUser, page, size);
            
            response.put("success", true);
            response.put("contents", result.get("contents"));
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

    // API 端点：获取单个内容详情（用于评论页）
    @GetMapping("/api/contents/{id}")
    @ResponseBody
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getContentById(
            @PathVariable("id") Long contentId,
            Authentication authentication,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String language = languageUtil.getLanguage(request);
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
            User currentUser = null;
            if (isAuthenticated) {
                currentUser = userService.findByUsername(authentication.getName());
            }

            Content content = contentService.getContentByIdWithSchool(contentId);
            if (content == null) {
                return ResponseEntity.notFound().build();
            }
            List<Content> filtered = contentService.filterContentsByPrivacy(List.of(content), currentUser);
            if (filtered.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            content = filtered.get(0);

            Map<String, Object> contentData = new HashMap<>();
            contentData.put("id", content.getId());
            contentData.put("title", null);
            contentData.put("content", translationService.getContentDisplayText(content, language));
            contentData.put("contentEn", content.getContentEn());
            contentData.put("likeCount", content.getLikeCount() != null ? content.getLikeCount() : 0);
            contentData.put("commentCount", commentService.countByContentId(content.getId()));
            contentData.put("isLiked", currentUser != null && likeService.isLikedByUser(currentUser.getId(), Like.EntityType.CONTENT, content.getId()));

            if (content.getSchool() != null) {
                Map<String, Object> schoolData = new HashMap<>();
                School school = content.getSchool();
                schoolData.put("id", school.getId());
                schoolData.put("name", school.getName());
                schoolData.put("nameEn", school.getNameEn());
                schoolData.put("displayName", translationService.getSchoolDisplayName(school, language));
                if (school.getParent() != null) {
                    Map<String, Object> parentData = new HashMap<>();
                    School parent = school.getParent();
                    parentData.put("id", parent.getId());
                    parentData.put("displayName", translationService.getSchoolDisplayName(parent, language));
                    schoolData.put("parent", parentData);
                }
                contentData.put("school", schoolData);
            }
            if (content.getPhilosopher() != null) {
                Philosopher p = content.getPhilosopher();
                Map<String, Object> philData = new HashMap<>();
                philData.put("id", p.getId());
                philData.put("displayName", translationService.getPhilosopherDisplayName(p, language));
                philData.put("dateRange", DateUtils.formatBirthYearToDateRange(p.getBirthYear(), p.getDeathYear()));
                contentData.put("philosopher", philData);
            }

            response.put("success", true);
            response.put("content", contentData);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error loading content {}: {}", contentId, e.getMessage());
            response.put("success", false);
            response.put("message", "加载失败");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // API 端点：获取单个哲学家的完整数据（用于AJAX加载和预加载）
    @GetMapping("/api/philosophers/{id}")
    @ResponseBody
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getPhilosopherData(
            @PathVariable("id") Long philosopherId,
            Authentication authentication,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 获取当前语言设置（根据IP自动判断默认语言）
            String language = languageUtil.getLanguage(request);
            
            Philosopher philosopher = philosopherService.getPhilosopherById(philosopherId);
            if (philosopher == null) {
                response.put("success", false);
                response.put("message", "Philosopher not found");
                return ResponseEntity.notFound().build();
            }

            // 获取当前用户信息用于隐私过滤
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
            User currentUser = null;
            if (isAuthenticated) {
                currentUser = (User) authentication.getPrincipal();
            }

            // 构建哲学家基本信息
            Map<String, Object> philosopherData = new HashMap<>();
            philosopherData.put("id", philosopher.getId());
            philosopherData.put("name", philosopher.getName());
            philosopherData.put("nameEn", philosopher.getNameEn());
            // 格式化日期范围：从birthYear和deathYear生成日期范围字符串
            String dateRange = DateUtils.formatBirthYearToDateRange(philosopher.getBirthYear(), philosopher.getDeathYear());
            philosopherData.put("dateRange", dateRange);
            philosopherData.put("bio", philosopher.getBio());
            philosopherData.put("bioEn", philosopher.getBioEn());
            philosopherData.put("imageUrl", philosopher.getImageUrl());
            philosopherData.put("birthYear", philosopher.getBirthYear());
            philosopherData.put("deathYear", philosopher.getDeathYear());
            
            // 添加翻译后的显示名称和传记
            philosopherData.put("displayName", translationService.getPhilosopherDisplayName(philosopher, language));
            philosopherData.put("displayBiography", translationService.getPhilosopherDisplayBiography(philosopher, language));
            
            // 获取关联的流派信息
            List<Map<String, Object>> schools = new ArrayList<>();
            if (philosopher.getSchools() != null) {
                for (School school : philosopher.getSchools()) {
                    Map<String, Object> schoolData = new HashMap<>();
                    schoolData.put("id", school.getId());
                    schoolData.put("name", school.getName());
                    schoolData.put("nameEn", school.getNameEn());
                    schoolData.put("displayName", translationService.getSchoolDisplayName(school, language));
                    schools.add(schoolData);
                }
            }
            philosopherData.put("schools", schools);
            
            // 获取前12条内容数据（按优先级排序）
            Map<String, Object> result = philosopherService.getContentsByPhilosopherIdWithPriorityPaged(philosopherId, 0, 12);
            
            @SuppressWarnings("unchecked")
            List<Content> contents = (List<Content>) result.get("contents");
            
            // 应用隐私和屏蔽过滤
            contents = contentService.filterContentsByPrivacy(contents, currentUser);
            
                // 构建内容数据
            List<Map<String, Object>> contentList = new ArrayList<>();
            for (Content content : contents) {
                try {
                    Map<String, Object> contentData = new HashMap<>();
                    contentData.put("id", content.getId());
                    contentData.put("title", null);
                    // 使用 TranslationService 获取显示文本
                    contentData.put("content", translationService.getContentDisplayText(content, language));
                    contentData.put("likeCount", content.getLikeCount() != null ? content.getLikeCount() : 0);
                    contentData.put("commentCount", commentService.countByContentId(content.getId()));
                    
                    // 流派信息
                    try {
                        if (content.getSchool() != null) {
                            Map<String, Object> schoolData = new HashMap<>();
                            School school = content.getSchool();
                            schoolData.put("id", school.getId());
                            schoolData.put("name", school.getName());
                            schoolData.put("nameEn", school.getNameEn());
                            schoolData.put("displayName", translationService.getSchoolDisplayName(school, language));
                            
                            // 父流派信息
                            try {
                                if (school.getParent() != null) {
                                    Map<String, Object> parentSchoolData = new HashMap<>();
                                    School parent = school.getParent();
                                    parentSchoolData.put("id", parent.getId());
                                    parentSchoolData.put("name", parent.getName());
                                    parentSchoolData.put("nameEn", parent.getNameEn());
                                    parentSchoolData.put("displayName", translationService.getSchoolDisplayName(parent, language));
                                    schoolData.put("parent", parentSchoolData);
                                }
                            } catch (Exception e) {
                                logger.warn("Error accessing school parent for content {}: {}", content.getId(), e.getMessage());
                                // 继续处理，不添加parent
                            }
                            
                            contentData.put("school", schoolData);
                        }
                    } catch (Exception e) {
                        logger.warn("Error processing school for content {}: {}", content.getId(), e.getMessage());
                        // 继续处理，不添加school
                    }
                    
                    // 作者信息
                    try {
                        if (content.getUser() != null) {
                            Map<String, Object> userData = new HashMap<>();
                            User user = content.getUser();
                            userData.put("id", user.getId());
                            userData.put("username", user.getUsername());
                            userData.put("role", user.getRole());
                            contentData.put("user", userData);
                        }
                    } catch (Exception e) {
                        logger.warn("Error processing user for content {}: {}", content.getId(), e.getMessage());
                        // 继续处理，不添加user
                    }
                    
                    contentData.put("philosopherId", philosopherId);
                    contentList.add(contentData);
                } catch (Exception e) {
                    logger.error("Error processing content {}: {}", content.getId(), e.getMessage(), e);
                    // 跳过这个内容，继续处理下一个
                }
            }
            
            philosopherData.put("contents", contentList);
            
            response.put("success", true);
            response.put("philosopher", philosopherData);
            response.put("hasMore", result.get("hasMore"));
            response.put("totalElements", result.get("totalElements"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error loading philosopher data: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Error loading philosopher data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    // API 端点：加载更多哲学家的内容（用于哲学家页面的无限滚动）
    @GetMapping("/api/philosophers/contents/more")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMorePhilosopherContents(
            @RequestParam("philosopherId") Long philosopherId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            Authentication authentication,
            HttpServletRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 获取当前语言设置（根据IP自动判断默认语言）
            String language = languageUtil.getLanguage(request);

            Philosopher philosopher = philosopherService.getPhilosopherById(philosopherId);
            if (philosopher == null) {
                response.put("success", false);
                response.put("message", "Philosopher not found");
                return ResponseEntity.notFound().build();
            }

            // 获取当前用户信息用于隐私过滤
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
            User currentUser = null;
            if (isAuthenticated) {
                currentUser = (User) authentication.getPrincipal();
            }

            // 获取分页数据
            Map<String, Object> result = philosopherService.getContentsByPhilosopherIdWithPriorityPaged(philosopherId, page, size);
            
            @SuppressWarnings("unchecked")
            List<Content> contents = (List<Content>) result.get("contents");
            
            // 应用隐私和屏蔽过滤
            contents = contentService.filterContentsByPrivacy(contents, currentUser);
            
            // 构建内容数据列表（包含翻译和关联信息）
            List<Map<String, Object>> contentList = new ArrayList<>();
            for (Content content : contents) {
                try {
                    Map<String, Object> contentData = new HashMap<>();
                    contentData.put("id", content.getId());
                    contentData.put("title", null);
                    // 使用 TranslationService 获取显示文本
                    contentData.put("content", translationService.getContentDisplayText(content, language));
                    contentData.put("likeCount", content.getLikeCount() != null ? content.getLikeCount() : 0);
                    contentData.put("commentCount", commentService.countByContentId(content.getId()));
                    
                    // 流派信息
                    try {
                        if (content.getSchool() != null) {
                            Map<String, Object> schoolData = new HashMap<>();
                            School school = content.getSchool();
                            schoolData.put("id", school.getId());
                            schoolData.put("name", school.getName());
                            schoolData.put("nameEn", school.getNameEn());
                            schoolData.put("displayName", translationService.getSchoolDisplayName(school, language));
                            
                            // 父流派信息
                            try {
                                if (school.getParent() != null) {
                                    Map<String, Object> parentSchoolData = new HashMap<>();
                                    School parent = school.getParent();
                                    parentSchoolData.put("id", parent.getId());
                                    parentSchoolData.put("name", parent.getName());
                                    parentSchoolData.put("nameEn", parent.getNameEn());
                                    parentSchoolData.put("displayName", translationService.getSchoolDisplayName(parent, language));
                                    schoolData.put("parent", parentSchoolData);
                                }
                            } catch (Exception e) {
                                // 忽略
                            }
                            
                            contentData.put("school", schoolData);
                        }
                    } catch (Exception e) {
                        // 忽略
                    }
                    
                    // 作者信息
                    try {
                        if (content.getUser() != null) {
                            Map<String, Object> userData = new HashMap<>();
                            User user = content.getUser();
                            userData.put("id", user.getId());
                            userData.put("username", user.getUsername());
                            userData.put("role", user.getRole());
                            contentData.put("user", userData);
                        }
                    } catch (Exception e) {
                        // 忽略
                    }
                    
                    contentData.put("philosopherId", philosopherId);
                    contentList.add(contentData);
                } catch (Exception e) {
                    logger.error("Error processing content {}: {}", content.getId(), e.getMessage(), e);
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
    
    // API 端点：获取随机名句
    @GetMapping("/api/quotes/random")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getRandomQuotes(
            @RequestParam(value = "count", defaultValue = "12") int count,
            @RequestParam(value = "excludeIds", required = false) String excludeIds,
            HttpServletRequest request,
            Authentication authentication) {
        
        try {
            // 获取当前语言设置（根据IP自动判断默认语言）
            String language = languageUtil.getLanguage(request);
            
            // 获取当前用户（用于隐私过滤）
            boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);
            User currentUser = null;
            if (isAuthenticated) {
                currentUser = (User) authentication.getPrincipal();
            }
            
            // 解析排除的ID列表
            List<Long> excludeIdList = new ArrayList<>();
            if (excludeIds != null && !excludeIds.trim().isEmpty()) {
                String[] ids = excludeIds.split(",");
                for (String id : ids) {
                    try {
                        excludeIdList.add(Long.parseLong(id.trim()));
                    } catch (NumberFormatException e) {
                        // 忽略无效的ID
                    }
                }
            }
            
            // 获取随机内容
            List<Content> contents;
            if (excludeIdList.isEmpty()) {
                contents = contentService.getRandomContents(count, currentUser);
            } else {
                contents = contentService.getRandomContentsExcluding(count, excludeIdList, currentUser);
            }
            
            // 转换为简化的JSON格式
            List<Map<String, Object>> result = new ArrayList<>();
            for (Content content : contents) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", content.getId());
                
                // 使用 TranslationService 获取显示文本
                String displayText = translationService.getContentDisplayText(content, language);
                item.put("contentText", displayText);
                
                // 获取哲学家名称
                if (content.getPhilosopher() != null) {
                    String philosopherName = translationService.getPhilosopherDisplayName(content.getPhilosopher(), language);
                    item.put("philosopherName", philosopherName);
                } else {
                    item.put("philosopherName", language.equals("en") ? "Unknown Philosopher" : "未知哲学家");
                }
                
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("获取随机名句失败: " + e.getMessage(), e);
            return ResponseEntity.internalServerError().body(new ArrayList<>());
        }
    }

}
    
    