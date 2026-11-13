package com.philosophy.service;

import com.philosophy.model.*;
import com.philosophy.repository.*;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.StringWriter;
import java.io.PrintWriter;
import java.util.List;
import java.util.Base64;
import java.time.format.DateTimeFormatter;

@Service
public class DataExportService {

    private static final Logger logger = LoggerFactory.getLogger(DataExportService.class);

    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final PhilosopherRepository philosopherRepository;
    private final ContentRepository contentRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final UserContentEditRepository userContentEditRepository;
    private final SchoolTranslationRepository schoolTranslationRepository;
    private final ContentTranslationRepository contentTranslationRepository;
    private final PhilosopherTranslationRepository philosopherTranslationRepository;
    private final ForumCategoryRepository forumCategoryRepository;
    private final ForumThreadRepository forumThreadRepository;
    private final ForumReplyRepository forumReplyRepository;

    public DataExportService(UserRepository userRepository,
                             SchoolRepository schoolRepository,
                             PhilosopherRepository philosopherRepository,
                             ContentRepository contentRepository,
                             CommentRepository commentRepository,
                             LikeRepository likeRepository,
                             UserContentEditRepository userContentEditRepository,
                             SchoolTranslationRepository schoolTranslationRepository,
                             ContentTranslationRepository contentTranslationRepository,
                             PhilosopherTranslationRepository philosopherTranslationRepository,
                             ForumCategoryRepository forumCategoryRepository,
                             ForumThreadRepository forumThreadRepository,
                             ForumReplyRepository forumReplyRepository) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.philosopherRepository = philosopherRepository;
        this.contentRepository = contentRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.userContentEditRepository = userContentEditRepository;
        this.schoolTranslationRepository = schoolTranslationRepository;
        this.contentTranslationRepository = contentTranslationRepository;
        this.philosopherTranslationRepository = philosopherTranslationRepository;
        this.forumCategoryRepository = forumCategoryRepository;
        this.forumThreadRepository = forumThreadRepository;
        this.forumReplyRepository = forumReplyRepository;
    }

    public String exportAllDataToCsv() {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        try {
            // 导出用户数据
            pw.println("用户数据");
            pw.println("ID,用户名,邮箱,密码,名字,姓氏,角色,启用状态,管理员登录尝试,点赞数,分配学派ID,设备类型,用户代理,头像URL,语言设置,主题设置,创建时间,更新时间");
            List<User> users = userRepository.findAll();
            logger.info("导出用户数据：查询到 {} 个用户", users.size());
            for (User user : users) {
                logger.debug("导出用户: ID={}, 用户名={}, 角色={}", user.getId(), user.getUsername(), user.getRole());
                String[] cols = new String[] {
                    String.valueOf(user.getId()),
                    escapeCsv(user.getUsername()),
                    escapeCsv(user.getEmail()),
                    escapeCsv(user.getPassword()),
                    escapeCsv(user.getFirstName()),
                    escapeCsv(user.getLastName()),
                    escapeCsv(user.getRole()),
                    user.isEnabled() ? "1" : "0",
                    String.valueOf(user.getAdminLoginAttempts()),
                    String.valueOf(user.getLikeCount()),
                    user.getAssignedSchoolId() != null ? user.getAssignedSchoolId().toString() : "",
                    escapeCsv(user.getDeviceType()),
                    escapeCsv(user.getUserAgent()),
                    escapeCsv(user.getAvatarUrl()),
                    escapeCsv(user.getLanguage() != null ? user.getLanguage() : ""),
                    escapeCsv(user.getTheme() != null ? user.getTheme() : ""),
                    user.getCreatedAt() != null ? user.getCreatedAt().format(formatter) : "未知时间",
                    user.getUpdatedAt() != null ? user.getUpdatedAt().format(formatter) : "未知时间"
                };
                pw.println(String.join(",", cols));
            }
            pw.println();

            // 导出学派数据
            pw.println("学派数据");
            pw.println("ID,名称,英文名称,描述,英文描述,父学派ID,创建者ID,点赞数,创建时间,更新时间");
            List<School> schools = schoolRepository.findAll();
            for (School school : schools) {
                pw.printf("%d,%s,%s,%s,%s,%s,%s,%d,%s,%s%n",
                    school.getId(),
                    escapeCsv(school.getName()),
                    escapeCsv(school.getNameEn()),
                    escapeCsv(school.getDescription()),
                    escapeCsv(school.getDescriptionEn()),
                    school.getParent() != null ? school.getParent().getId().toString() : "",
                    school.getUser() != null ? school.getUser().getId().toString() : "",
                    school.getLikeCount(),
                    school.getCreatedAt() != null ? school.getCreatedAt().format(formatter) : "未知时间",
                    school.getUpdatedAt() != null ? school.getUpdatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出哲学家数据
            pw.println("哲学家数据");
            pw.println("ID,姓名,英文姓名,生年,卒年,国籍,传记,英文传记,图片内容类型,图片文件名,图片Base64,创建者ID,点赞数,创建时间,更新时间");
            List<Philosopher> philosophers = philosopherRepository.findAll();
            for (Philosopher philosopher : philosophers) {
                byte[] imageData = philosopher.getImageData();
                boolean hasImageData = imageData != null && imageData.length > 0;
                String imageContentType = hasImageData ? philosopher.getImageContentType() : "";
                String imageFileName = hasImageData ? philosopher.getImageFileName() : "";
                String imageBase64 = hasImageData ? Base64.getEncoder().encodeToString(imageData) : "";
                pw.printf("%d,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%d,%s,%s%n",
                    philosopher.getId(),
                    escapeCsv(philosopher.getName()),
                    escapeCsv(philosopher.getNameEn()),
                    philosopher.getBirthYear() != null ? philosopher.getBirthYear().toString() : "",
                    philosopher.getDeathYear() != null ? philosopher.getDeathYear().toString() : "",
                    escapeCsv(philosopher.getNationality()),
                    escapeCsv(philosopher.getBio()),
                    escapeCsv(philosopher.getBioEn()),
                    escapeCsv(imageContentType),
                    escapeCsv(imageFileName),
                    escapeCsv(imageBase64),
                    philosopher.getUser() != null ? philosopher.getUser().getId().toString() : "",
                    philosopher.getLikeCount(),
                    philosopher.getCreatedAt() != null ? philosopher.getCreatedAt().format(formatter) : "未知时间",
                    philosopher.getUpdatedAt() != null ? philosopher.getUpdatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出哲学家-学派关联数据
            pw.println("哲学家学派关联数据");
            pw.println("哲学家ID,学派ID");
            for (Philosopher philosopher : philosophers) {
                for (School school : philosopher.getSchools()) {
                    pw.printf("%d,%d%n", philosopher.getId(), school.getId());
                }
            }
            pw.println();

            // 导出内容数据
            pw.println("内容数据");
            pw.println("ID,内容,内容英文,哲学家ID,学派ID,作者ID,标题,排序索引,锁定用户ID,锁定时间,锁定至,点赞数,状态,版本,创建时间,更新时间");
            List<Content> contents = contentRepository.findAll();
            for (Content content : contents) {
                pw.printf("%d,%s,%s,%s,%s,%s,%s,%d,%s,%s,%s,%d,%d,%s,%s,%s%n",
                    content.getId(),
                    escapeCsv(content.getContent()),
                    escapeCsv(content.getContentEn()),
                    content.getPhilosopher() != null ? content.getPhilosopher().getId().toString() : "",
                    content.getSchool() != null ? content.getSchool().getId().toString() : "",
                    content.getUser() != null ? content.getUser().getId().toString() : "",
                    "",
                    content.getOrderIndex() != null ? content.getOrderIndex() : 0,
                    content.getLockedByUser() != null ? content.getLockedByUser().getId().toString() : "",
                    content.getLockedAt() != null ? content.getLockedAt().format(formatter) : "",
                    content.getLockedUntil() != null ? content.getLockedUntil().format(formatter) : "",
                    content.getLikeCount(),
                    content.getStatus(),
                    content.getVersion() != null ? content.getVersion().toString() : "0",
                    content.getCreatedAt() != null ? content.getCreatedAt().format(formatter) : "未知时间",
                    content.getUpdatedAt() != null ? content.getUpdatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出评论数据
            pw.println("评论数据");
            pw.println("ID,内容,用户名,内容ID,父评论ID,创建时间");
            List<Comment> comments = commentRepository.findAll();
            for (Comment comment : comments) {
                pw.printf("%d,%s,%s,%s,%s,%s%n",
                    comment.getId(),
                    escapeCsv(comment.getBody()),
                    comment.getUser() != null ? escapeCsv(comment.getUser().getUsername()) : "",
                    comment.getContent() != null ? comment.getContent().getId().toString() : "",
                    comment.getParent() != null ? comment.getParent().getId().toString() : "",
                    comment.getCreatedAt() != null ? comment.getCreatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出点赞数据
            pw.println("点赞数据");
            pw.println("ID,用户ID,实体类型,实体ID,创建时间");
            List<Like> likes = likeRepository.findAll();
            for (Like like : likes) {
                pw.printf("%d,%d,%s,%d,%s%n",
                    like.getId(),
                    like.getUser().getId(),
                    like.getEntityType().toString(),
                    like.getEntityId(),
                    like.getCreatedAt() != null ? like.getCreatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出用户内容编辑数据
            pw.println("用户内容编辑数据");
            pw.println("ID,用户ID,内容,标题,哲学家ID,学派ID,状态,创建时间");
            List<UserContentEdit> edits = userContentEditRepository.findAll();
            for (UserContentEdit edit : edits) {
                pw.printf("%d,%d,%s,%s,%d,%d,%s,%s%n",
                    edit.getId(),
                    edit.getUser().getId(),
                    escapeCsv(edit.getContent()),
                    escapeCsv(edit.getTitle()),
                    edit.getPhilosopher().getId(),
                    edit.getSchool().getId(),
                    edit.getStatus().toString(),
                    edit.getCreatedAt() != null ? edit.getCreatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出学派翻译数据
            pw.println("学派翻译数据");
            pw.println("ID,学派ID,语言代码,英文名称,英文描述,创建时间");
            List<SchoolTranslation> schoolTranslations = schoolTranslationRepository.findAll();
            for (SchoolTranslation translation : schoolTranslations) {
                pw.printf("%d,%d,%s,%s,%s,%s%n",
                    translation.getId(),
                    translation.getSchool().getId(),
                    escapeCsv(translation.getLanguageCode()),
                    escapeCsv(translation.getNameEn()),
                    escapeCsv(translation.getDescriptionEn()),
                    translation.getCreatedAt() != null ? translation.getCreatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出内容翻译数据
            pw.println("内容翻译数据");
            pw.println("ID,内容ID,语言代码,英文内容,创建时间");
            List<ContentTranslation> contentTranslations = contentTranslationRepository.findAll();
            for (ContentTranslation translation : contentTranslations) {
                pw.printf("%d,%d,%s,%s,%s%n",
                    translation.getId(),
                    translation.getContent().getId(),
                    escapeCsv(translation.getLanguageCode()),
                    escapeCsv(translation.getContentEn()),
                    translation.getCreatedAt() != null ? translation.getCreatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            // 导出哲学家翻译数据
            pw.println("哲学家翻译数据");
            pw.println("ID,哲学家ID,语言代码,英文名称,英文传记,创建时间");
            List<PhilosopherTranslation> philosopherTranslations = philosopherTranslationRepository.findAll();
            for (PhilosopherTranslation translation : philosopherTranslations) {
                pw.printf("%d,%d,%s,%s,%s,%s%n",
                    translation.getId(),
                    translation.getPhilosopher().getId(),
                    escapeCsv(translation.getLanguageCode()),
                    escapeCsv(translation.getNameEn()),
                    escapeCsv(translation.getBiographyEn()),
                    translation.getCreatedAt() != null ? translation.getCreatedAt().format(formatter) : "未知时间"
                );
            }
            pw.println();

            pw.println("论坛板块数据");
            pw.println("ID,标识,名称,英文名称,描述,英文描述,排序");
            for (ForumCategory category : forumCategoryRepository.findAllByOrderBySortOrderAscIdAsc()) {
                pw.println(String.join(",",
                    String.valueOf(category.getId()),
                    escapeCsv(category.getSlug()),
                    escapeCsv(category.getName()),
                    escapeCsv(category.getNameEn()),
                    escapeCsv(category.getDescription()),
                    escapeCsv(category.getDescriptionEn()),
                    String.valueOf(category.getSortOrder())
                ));
            }
            pw.println();

            pw.println("论坛帖子数据");
            pw.println("ID,板块ID,作者ID,标题,正文,回复数,浏览数,是否置顶,是否锁定,创建时间,更新时间,最后活动时间");
            for (ForumThread thread : forumThreadRepository.findAllForExport()) {
                pw.println(String.join(",",
                    String.valueOf(thread.getId()),
                    thread.getCategory() != null ? thread.getCategory().getId().toString() : "",
                    thread.getAuthor() != null ? thread.getAuthor().getId().toString() : "",
                    escapeCsv(thread.getTitle()),
                    escapeCsv(thread.getBody()),
                    String.valueOf(thread.getReplyCount()),
                    String.valueOf(thread.getViewCount()),
                    thread.isPinned() ? "1" : "0",
                    thread.isLocked() ? "1" : "0",
                    formatExportTime(thread.getCreatedAt(), formatter),
                    formatExportTime(thread.getUpdatedAt(), formatter),
                    formatExportTime(thread.getLastActivityAt(), formatter)
                ));
            }
            pw.println();

            pw.println("论坛回复数据");
            pw.println("ID,帖子ID,父回复ID,作者ID,正文,创建时间,更新时间");
            for (ForumReply reply : forumReplyRepository.findAllForExport()) {
                pw.println(String.join(",",
                    String.valueOf(reply.getId()),
                    reply.getThread() != null ? reply.getThread().getId().toString() : "",
                    reply.getParent() != null ? reply.getParent().getId().toString() : "",
                    reply.getAuthor() != null ? reply.getAuthor().getId().toString() : "",
                    escapeCsv(reply.getBody()),
                    formatExportTime(reply.getCreatedAt(), formatter),
                    formatExportTime(reply.getUpdatedAt(), formatter)
                ));
            }
            pw.println();

        } catch (Exception e) {
            String errorMsg = "导出过程中发生错误: " + e.getMessage();
            pw.println(errorMsg);
            logger.error(errorMsg, e);
        }

        return sw.toString();
    }

    private String formatExportTime(java.time.LocalDateTime value, DateTimeFormatter formatter) {
        return value != null ? value.format(formatter) : "";
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        // 如果包含逗号、引号或换行符，需要用引号包围并转义引号
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

}