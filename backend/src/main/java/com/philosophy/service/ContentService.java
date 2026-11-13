package com.philosophy.service;

import com.philosophy.model.Content;
import com.philosophy.model.User;
import com.philosophy.model.UserContentEdit;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.ContentTranslationRepository;
import com.philosophy.repository.UserContentEditRepository;
import com.philosophy.util.SearchNormalizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContentService {

    private final ContentRepository contentRepository;
    private final PhilosopherService philosopherService;
    private final UserContentEditRepository userContentEditRepository;
    private final ContentTranslationRepository contentTranslationRepository;

    private static final Logger logger = LoggerFactory.getLogger(ContentService.class);

    public ContentService(ContentRepository contentRepository, PhilosopherService philosopherService,
                         UserContentEditRepository userContentEditRepository, 
                         ContentTranslationRepository contentTranslationRepository) {
        this.contentRepository = contentRepository;
        this.philosopherService = philosopherService;
        this.userContentEditRepository = userContentEditRepository;
        this.contentTranslationRepository = contentTranslationRepository;
    }

    @Transactional(readOnly = true)
    public List<Content> findAll() {
        // 使用自定义查询方法，预先加载关联的philosopher对象
        return contentRepository.findAllWithPhilosopher(); // 已配置JOIN FETCH预加载
    }

    @Transactional(readOnly = true)
    public Optional<Content> findById(Long id) {
        return contentRepository.findByIdWithPhilosopher(id);
    }

    @Transactional
    public Content save(Content content) {
        // 获取原始内容以检查相关信息
        Long originalPhilosopherId = null;
        if (content.getId() != null) {
            Content originalContent = contentRepository.findById(content.getId()).orElse(null);
            if (originalContent != null) {
                if (originalContent.getPhilosopher() != null) {
                    originalPhilosopherId = originalContent.getPhilosopher().getId();
                }
            }
        }

        Content savedContent = contentRepository.save(content);

        // 获取新的哲学家ID
        Long newPhilosopherId = null;
        if (savedContent.getPhilosopher() != null) {
            newPhilosopherId = savedContent.getPhilosopher().getId();
        }

        // 只要内容有关联的哲学家，就重新计算该哲学家的流派
        if (newPhilosopherId != null) {
            philosopherService.recalculatePhilosopherSchools(newPhilosopherId);
        }

        // 如果哲学家被更改，也需要重新计算原哲学家的流派
        if (originalPhilosopherId != null && !originalPhilosopherId.equals(newPhilosopherId)) {
            philosopherService.recalculatePhilosopherSchools(originalPhilosopherId);
        }

        return savedContent;
    }

    @Transactional
    public Content saveContentWithUser(Content content, User user) {
        // 仅在创建新内容时设置创建者，编辑时不覆盖原作者
        if (content.getId() == null && content.getUser() == null) {
            content.setUser(user);
        }

        return save(content);
    }

    @Transactional
    public Content saveContentForAdmin(Content contentToSave, User editor) {
        // 新建时设置作者；编辑已有内容时保持原作者不变
        if (contentToSave.getId() == null || contentToSave.getUser() == null) {
            contentToSave.setUser(editor);
        }

        Content savedContent = save(contentToSave);

        return savedContent;
    }

    // 根据用户ID获取内容
    public List<Content> getContentsByUserId(Long userId) {
        List<Content> contents = contentRepository.findByUserId(userId);
        if (contents == null) {
            return new ArrayList<>();
        }
        // 过滤掉null值
        return contents.stream()
                .filter(content -> content != null)
                .collect(ArrayList::new, (list, content) -> {
                    // 确保内容不为null
                    if (content.getContent() == null) {
                        content.setContent("");
                    }
                    list.add(content);
                }, ArrayList::addAll);
    }

    // 根据用户ID统计内容数量
    public long countContentsByUserId(Long userId) {
        return contentRepository.countByUserId(userId);
    }

    @Transactional
    public void deleteById(Long id) {
        Content content = contentRepository.findByIdWithPhilosopher(id).orElse(null);
        Long philosopherId = null;

        if (content != null && content.getPhilosopher() != null) {
            philosopherId = content.getPhilosopher().getId();
        }

        // 先删除相关的用户内容编辑记录，避免外键约束错误
        userContentEditRepository.deleteByOriginalContentId(id);
        
        // 先删除相关的翻译记录，避免外键约束错误
        contentTranslationRepository.deleteByContentId(id);

        // 使用不依赖版本字段的删除方法
        contentRepository.deleteByIdWithoutVersion(id);

        // 删除内容后重新计算相关哲学家的流派
        if (philosopherId != null) {
            philosopherService.recalculatePhilosopherSchools(philosopherId);
        }
    }

    @Transactional
    public void saveContent(Content content) {
        Content savedContent = save(content);
        
        // 只有在内容有关联哲学家时才重新计算流派
        if (savedContent.getPhilosopher() != null) {
            philosopherService.recalculatePhilosopherSchools(savedContent.getPhilosopher().getId());
        }
    }

    // 根据哲学家ID查找内容
    @Transactional(readOnly = true)
    public List<Content> findByPhilosopherId(Long philosopherId) {
        return contentRepository.findByPhilosopherId(philosopherId);
    }
    
    // 根据哲学家ID查找内容（预加载流派关系）
    @Transactional(readOnly = true)
    public List<Content> findByPhilosopherIdWithSchool(Long philosopherId) {
        return contentRepository.findByPhilosopherIdWithSchool(philosopherId);
    }

    
    // 根据流派ID查找内容
    @Transactional(readOnly = true)
    public List<Content> findByPhilosopherSchoolsId(Long schoolId) {
        return contentRepository.findByPhilosopherSchoolsId(schoolId);
    }
    
    // 获取所有关联指定流派的内容（包括直接关联和通过哲学家关联）
    @Transactional(readOnly = true)
    public List<Content> findAllBySchoolIdWithPhilosopher(Long schoolId) {
        try {
            // 使用JPQL查询获取关联内容，避免懒加载问题
            return contentRepository.findAllBySchoolIdWithPhilosopher(schoolId);
        } catch (Exception e) {
            // 如果出现异常，返回空列表
            return new ArrayList<>();
        }
    }

    // AdminController需要的方法
    @Transactional(readOnly = true)
    public Long countContents() {
        return contentRepository.count();
    }

    @Transactional(readOnly = true)
    public long countContentsBySchoolIds(List<Long> schoolIds) {
        return contentRepository.countBySchoolIds(schoolIds);
    }
    
    @Transactional(readOnly = true)
    public List<Content> getContentsBySchoolIds(List<Long> schoolIds) {
        return contentRepository.findContentsBySchoolIds(schoolIds);
    }

    @Transactional(readOnly = true)
    public List<Content> getAllContents() {
        return contentRepository.findAll();
    }

    // 删除以下重复方法定义
    // @Transactional(readOnly = true)
    // public List<Content> getAllContents() {
    //     return findAll();
    // }

    @Transactional(readOnly = true)
    public Content getContentById(Long id) {
        return findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public Content getContentByIdWithSchool(Long id) {
        return contentRepository.findByIdWithPhilosopherAndSchool(id).orElse(null);
    }

    @Transactional
    public void deleteContent(Long id) {
        Content content = contentRepository.findById(id).orElse(null);
        if (content != null) {
            // 先删除相关的用户内容编辑记录
            userContentEditRepository.deleteByOriginalContentId(id);
            
            // 先删除相关的翻译记录，避免外键约束错误
            contentTranslationRepository.deleteByContentId(id);
            
            Long philosopherId = null;
            if (content.getPhilosopher() != null) {
                philosopherId = content.getPhilosopher().getId();
            }
            
            // 使用不依赖版本字段的删除方法
            contentRepository.deleteByIdWithoutVersion(id);

            // 如果内容有关联的哲学家，则重新计算其流派
            if (philosopherId != null) {
                philosopherService.recalculatePhilosopherSchools(philosopherId);
            }
        }
    }
    
    // 搜索内容（支持关键词）
    @Transactional(readOnly = true)
    public List<Content> searchContents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String trimmed = query.trim();
        List<String> rawWords = SearchNormalizer.rawWords(trimmed);
        if (rawWords.isEmpty()) {
            return new ArrayList<>();
        }

        // 空格分词默认 OR：逐词做轻量查询并合并去重
        Map<Long, Content> merged = new LinkedHashMap<>();
        for (String word : rawWords) {
            List<Content> simpleMatches = contentRepository.searchByContentOrContentEnOrTitle(word);
            for (Content c : simpleMatches) {
                if (c.getId() != null) {
                    merged.putIfAbsent(c.getId(), c);
                }
            }
        }

        // 单词时再补充重查询，保留去标点/子序列能力
        if (rawWords.size() == 1) {
            String normalized = SearchNormalizer.normalize(trimmed);
            if (!normalized.isEmpty()) {
                boolean strictAsciiToken = SearchNormalizer.isAsciiAlnumToken(trimmed);
                boolean enableSubsequence = !strictAsciiToken && SearchNormalizer.shouldEnableSubsequence(trimmed, normalized);
                String subsequencePattern = SearchNormalizer.buildSubsequenceLikePattern(normalized);
                List<Content> heavyMatches = contentRepository.searchByContentOrContentEnOrTitleNormalized(trimmed, normalized, subsequencePattern, enableSubsequence);
                if (strictAsciiToken) {
                    heavyMatches = heavyMatches.stream().filter(c -> contentMatchesLiteralQuery(c, trimmed)).collect(Collectors.toList());
                }
                for (Content c : heavyMatches) {
                    if (c.getId() != null) {
                        merged.putIfAbsent(c.getId(), c);
                    }
                }
            }
        }

        List<Content> ranked = new ArrayList<>(merged.values());
        sortSearchResults(ranked, trimmed, rawWords);
        return ranked;
    }

    private void sortSearchResults(List<Content> contents, String rawQuery, List<String> rawWords) {
        if (contents == null || contents.size() < 2) {
            return;
        }
        String normalizedQuery = SearchNormalizer.normalize(rawQuery);
        List<String> normalizedWords = SearchNormalizer.normalizedWords(rawQuery);
        Map<Content, Integer> scoreMap = new HashMap<>();

        for (Content content : contents) {
            int score = Math.max(
                    SearchNormalizer.scoreTextMatch(content.getContent(), rawQuery, normalizedQuery, rawWords, normalizedWords),
                    SearchNormalizer.scoreTextMatch(content.getContentEn(), rawQuery, normalizedQuery, rawWords, normalizedWords)
            );
            scoreMap.put(content, score);
        }

        contents.sort(
                Comparator.comparingInt((Content content) -> scoreMap.getOrDefault(content, 0)).reversed()
                        .thenComparingInt(content -> safeLength(content.getContent(), content.getContentEn()))
                        .thenComparing((Content content) -> {
                            Integer likeCount = content.getLikeCount();
                            return likeCount == null ? Integer.MIN_VALUE : likeCount;
                        }, Comparator.reverseOrder())
                        .thenComparing(content -> content.getId() == null ? Long.MAX_VALUE : content.getId())
        );
    }

    private int safeLength(String primary, String fallback) {
        String value = primary != null && !primary.isBlank() ? primary : fallback;
        return value == null ? Integer.MAX_VALUE : value.length();
    }

    /** 严格字面匹配（忽略大小写），用于英文数字词收紧结果。 */
    private boolean contentMatchesLiteralQuery(Content c, String query) {
        return SearchNormalizer.containsIgnoreCase(c.getContent(), query)
                || SearchNormalizer.containsIgnoreCase(c.getContentEn(), query);
    }

    // 获取指定哲学家和流派的内容，按用户角色优先级排序
    @Transactional(readOnly = true)
    public List<Content> findByPhilosopherAndSchoolWithPriority(Long philosopherId, Long schoolId) {
        return contentRepository.findByPhilosopherAndSchoolWithPriority(philosopherId, schoolId);
    }

    // 获取指定哲学家和流派的内容，按用户角色优先级排序（包含用户编辑的内容）
    @Transactional(readOnly = true)
    public List<Content> findByPhilosopherAndSchoolWithUserPriority(Long philosopherId, Long schoolId) {
        return contentRepository.findByPhilosopherAndSchoolWithUserPriority(philosopherId, schoolId);
    }
    
    // 获取指定哲学家和流派的所有内容（包括用户编辑的内容）
    @Transactional(readOnly = true)
    public List<Content> findByPhilosopherAndSchoolAll(Long philosopherId, Long schoolId) {
        // 获取原始内容
        List<Content> originalContents = contentRepository.findByPhilosopherAndSchoolAll(philosopherId, schoolId);

        // 合并内容：将用户编辑的内容添加到原始内容列表中
        // 注意：这里我们需要创建一个包装类或者修改返回类型来同时包含两种类型的内容
        // 暂时只返回原始内容，用户编辑内容需要单独处理
        return originalContents;
    }

    // 获取指定哲学家和流派的原始内容
    @Transactional(readOnly = true)
    public List<Content> findOriginalContentsByPhilosopherAndSchool(Long philosopherId, Long schoolId) {
        return contentRepository.findByPhilosopherAndSchoolAll(philosopherId, schoolId);
    }

    // 获取指定哲学家和流派的用户编辑内容
    @Transactional(readOnly = true)
    public List<UserContentEdit> findUserEditsByPhilosopherAndSchool(Long philosopherId, Long schoolId) {
        return userContentEditRepository.findByPhilosopherIdAndSchoolId(philosopherId, schoolId);
    }
    
    // 获取指定流派的内容，只包含管理员编辑的内容
    @Transactional(readOnly = true)
    public List<Content> findBySchoolIdsAdminModeratorOnly(List<Long> schoolIds) {
        return contentRepository.findBySchoolIdsAdminModeratorOnly(schoolIds);
    }


    // 获取管理员创建的所有内容
    @Transactional(readOnly = true)
    public List<Content> findAllAdminModeratorContents() {
        return contentRepository.findAll().stream()
                .filter(content -> content.getUser() != null &&
                        "ADMIN".equals(content.getUser().getRole()))
                .collect(java.util.stream.Collectors.toList());
    }

    // 获取用户自己的内容（分页）
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Content> findUserOwnContents(Long userId, org.springframework.data.domain.Pageable pageable) {
        return contentRepository.findByUserId(userId, pageable);
    }

    // 获取用户自己的所有内容
    @Transactional(readOnly = true)
    public List<Content> findUserOwnContents(Long userId) {
        return contentRepository.findByUserId(userId);
    }

    /**
     * 获取所有内容并按优先级排序
     * 优先级：管理员 > 用户（按点赞数排序）
     * @return 按优先级排序的内容列表
     */
    @Transactional(readOnly = true)
    public List<Content> findAllWithPrioritySort() {
        List<Content> allContents = findAll();
        
        // 分离管理员内容和用户内容
        List<Content> adminModeratorContents = new ArrayList<>();
        List<Content> userContents = new ArrayList<>();

        for (Content content : allContents) {
            if (isAdminOrModerator(content.getUser())) {
                adminModeratorContents.add(content);
            } else {
                userContents.add(content);
            }
        }

        // 对管理员内容按角色优先级和点赞数排序
        adminModeratorContents.sort((c1, c2) -> {
            int priority1 = getUserPriority(c1.getUser());
            int priority2 = getUserPriority(c2.getUser());
            int roleComparison = Integer.compare(priority1, priority2);
            if (roleComparison != 0) {
                return roleComparison;
            }
            return Integer.compare(c2.getLikeCount(), c1.getLikeCount());
        });

        // 对用户内容按点赞数降序排序
        userContents.sort((c1, c2) -> Integer.compare(c2.getLikeCount(), c1.getLikeCount()));

        // 合并结果：先显示管理员内容，再显示用户内容
        List<Content> result = new ArrayList<>();
        result.addAll(adminModeratorContents);
        result.addAll(userContents);

        return result;
    }

    /**
     * 获取所有内容并按优先级排序（分页版本）- 用于内容总览页面的无限滚动
     * 优先级：管理员 > 用户（按点赞数排序）
     * @param page 页码（从0开始）
     * @param size 每页大小
     * @return 包含内容列表和分页信息的Map
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> findAllWithPrioritySortPaged(int page, int size) {
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        
        try {
            // 创建分页请求
            org.springframework.data.domain.Pageable pageable = 
                org.springframework.data.domain.PageRequest.of(page, size);
            
            // 获取分页数据（已按优先级排序）
            org.springframework.data.domain.Page<Content> contentPage = 
                contentRepository.findAllWithPriorityPaged(pageable);
            
            result.put("contents", contentPage.getContent());
            result.put("hasMore", contentPage.hasNext());
            result.put("totalElements", contentPage.getTotalElements());
            result.put("totalPages", contentPage.getTotalPages());
            result.put("currentPage", page);
            
            return result;
        } catch (Exception e) {
            logger.error("Error getting contents with priority (paged): " + e.getMessage(), e);
            result.put("contents", new ArrayList<>());
            result.put("hasMore", false);
            result.put("totalElements", 0L);
            return result;
        }
    }

    /**
     * 获取用户角色优先级
     * ADMIN = 1, 其他 = 2
     */
    private int getUserPriority(User user) {
        if (user == null) {
            return 2;
        }
        return "ADMIN".equals(user.getRole()) ? 1 : 2;
    }

    /**
     * 判断用户是否为管理员
     */
    private boolean isAdminOrModerator(User user) {
        return user != null && "ADMIN".equals(user.getRole());
    }

    /**
     * 对内容列表进行优先级排序
     * 优先级：管理员 > 用户（按点赞数排序）
     * @param contents 要排序的内容列表
     * @return 排序后的内容列表
     */
    public List<Content> sortContentsByPriority(List<Content> contents) {
        if (contents == null || contents.isEmpty()) {
            return contents;
        }

        // 分离管理员内容和用户内容
        List<Content> adminModeratorContents = new ArrayList<>();
        List<Content> userContents = new ArrayList<>();

        for (Content content : contents) {
            if (isAdminOrModerator(content.getUser())) {
                adminModeratorContents.add(content);
            } else {
                userContents.add(content);
            }
        }

        // 对管理员内容按角色优先级和点赞数排序
        adminModeratorContents.sort((c1, c2) -> {
            int priority1 = getUserPriority(c1.getUser());
            int priority2 = getUserPriority(c2.getUser());
            int roleComparison = Integer.compare(priority1, priority2);
            if (roleComparison != 0) {
                return roleComparison;
            }
            return Integer.compare(c2.getLikeCount(), c1.getLikeCount());
        });

        // 对用户内容按点赞数降序排序
        userContents.sort((c1, c2) -> Integer.compare(c2.getLikeCount(), c1.getLikeCount()));

        // 合并结果：先显示管理员内容，再显示用户内容
        List<Content> result = new ArrayList<>();
        result.addAll(adminModeratorContents);
        result.addAll(userContents);

        return result;
    }

    /**
     * 锁定内容 - 只有管理员可以锁定内容
     * @param contentId 内容ID
     * @param user 执行锁定的用户
     * @return 是否锁定成功
     */
    @Transactional
    public boolean lockContent(Long contentId, User user) {
        Content content = getContentById(contentId);
        if (content == null) {
            return false;
        }

        // 检查用户是否有权限锁定内容
        if (!canUserLockContent(user, content)) {
            return false;
        }

        // 设置锁定信息
        content.setLockedByUser(user);
        content.setLockedAt(java.time.LocalDateTime.now());
        contentRepository.save(content);
        return true;
    }

    /**
     * 解锁内容 - 只有锁定内容的用户可以解锁
     * @param contentId 内容ID
     * @param user 执行解锁的用户
     * @return 是否解锁成功
     */
    @Transactional
    public boolean unlockContent(Long contentId, User user) {
        Content content = getContentById(contentId);
        if (content == null) {
            return false;
        }

        // 检查用户是否有权限解锁内容
        if (!canUserUnlockContent(user, content)) {
            return false;
        }

        // 清除锁定信息
        content.setLockedByUser(null);
        content.setLockedAt(null);
        contentRepository.save(content);
        return true;
    }

    /**
     * 检查用户是否可以编辑内容（包括锁定检查）
     * @param user 用户
     * @param content 内容
     * @return 是否可以编辑
     */
    @Transactional(readOnly = true)
    public boolean canUserEditContent(User user, Content content) {
        if (user == null || content == null) {
            return false;
        }

        // 管理员可以编辑所有内容
        if ("ADMIN".equals(user.getRole())) {
            return true;
        }

        // 如果内容被锁定，只有锁定者本人可以编辑
        if (content.isLocked()) {
            return content.getLockedByUser() != null &&
                content.getLockedByUser().getId().equals(user.getId());
        }

        // 普通用户只能编辑自己的内容
        return content.getUser() != null &&
               content.getUser().getId().equals(user.getId());
    }

    /**
     * 检查用户是否可以锁定内容
     * @param user 用户
     * @param content 内容
     * @return 是否可以锁定
     */
    @Transactional(readOnly = true)
    public boolean canUserLockContent(User user, Content content) {
        if (user == null || content == null) {
            return false;
        }

        // 只有管理员可以锁定内容
        if (!"ADMIN".equals(user.getRole())) {
            return false;
        }

        return !content.isLocked();
    }

    /**
     * 检查用户是否可以解锁内容
     * @param user 用户
     * @param content 内容
     * @return 是否可以解锁
     */
    @Transactional(readOnly = true)
    public boolean canUserUnlockContent(User user, Content content) {
        if (user == null || content == null) {
            return false;
        }

        // 只有管理员可以解锁内容
        if (!"ADMIN".equals(user.getRole())) {
            return false;
        }

        return content.isLocked();
    }
}