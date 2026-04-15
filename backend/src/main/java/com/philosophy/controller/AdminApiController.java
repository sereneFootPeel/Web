package com.philosophy.controller;

import com.philosophy.model.Content;
import com.philosophy.model.Philosopher;
import com.philosophy.model.School;
import com.philosophy.model.User;
import com.philosophy.service.UserService;
import com.philosophy.service.PhilosopherService;
import com.philosophy.service.SchoolService;
import com.philosophy.service.ContentService;
import com.philosophy.service.DataExportService;
import com.philosophy.service.DataImportService;
import com.philosophy.service.EmailService;
import com.philosophy.service.TranslationService;
import com.philosophy.util.DateUtils;
import com.philosophy.util.PinyinStringComparator;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

    private final UserService userService;
    private final PhilosopherService philosopherService;
    private final SchoolService schoolService;
    private final ContentService contentService;
    private final DataImportService dataImportService;
    private final DataExportService dataExportService;
    private final EmailService emailService;
    private final TranslationService translationService;
    private final PinyinStringComparator pinyinComparator = new PinyinStringComparator();

    public AdminApiController(UserService userService, PhilosopherService philosopherService,
                             SchoolService schoolService, ContentService contentService,
                             DataImportService dataImportService, DataExportService dataExportService,
                             EmailService emailService, TranslationService translationService) {
        this.userService = userService;
        this.philosopherService = philosopherService;
        this.schoolService = schoolService;
        this.contentService = contentService;
        this.dataImportService = dataImportService;
        this.dataExportService = dataExportService;
        this.emailService = emailService;
        this.translationService = translationService;
    }

    private void requireAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("未登录");
        }
        boolean admin = auth.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!admin) {
            throw new org.springframework.security.access.AccessDeniedException("需要管理员权限");
        }
    }

    private User requireAdminUser(Authentication auth) {
        requireAdmin(auth);
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }
        return userService.findByUsername(auth.getName());
    }

    private String normalizeRole(String role) {
        String normalized = role == null ? "USER" : role.trim().toUpperCase();
        return switch (normalized) {
            case "ADMIN", "MODERATOR", "USER" -> normalized;
            default -> "USER";
        };
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.longValue();
        }
        String str = String.valueOf(value).trim();
        if (str.isEmpty()) {
            return null;
        }
        return Long.parseLong(str);
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.intValue();
        }
        String str = String.valueOf(value).trim();
        if (str.isEmpty()) {
            return null;
        }
        return Integer.parseInt(str);
    }

    private Boolean asBoolean(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean b) {
            return b;
        }
        String str = String.valueOf(value).trim().toLowerCase();
        return "true".equals(str) || "1".equals(str) || "yes".equals(str) || "on".equals(str);
    }

    private Map<String, Object> userMap(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId());
        m.put("username", u.getUsername());
        m.put("email", u.getEmail());
        m.put("role", u.getRole());
        m.put("enabled", u.isEnabled());
        m.put("firstName", u.getFirstName());
        m.put("lastName", u.getLastName());
        return m;
    }

    private Map<String, Object> philosopherMap(Philosopher p) {
        Map<String, Object> m = new HashMap<>();
        String translatedNameEn = translationService.getPhilosopherDisplayName(p, "en");
        String translatedBioEn = translationService.getPhilosopherDisplayBiography(p, "en");
        m.put("id", p.getId());
        m.put("name", p.getName());
        m.put("nameEn", translatedNameEn != null && !translatedNameEn.equals(p.getName()) ? translatedNameEn : null);
        m.put("bio", p.getBio());
        m.put("bioEn", translatedBioEn != null && !translatedBioEn.equals(p.getBio()) ? translatedBioEn : null);
        m.put("birthYear", p.getBirthYear());
        m.put("deathYear", p.getDeathYear());
        m.put("birthDeathDate", resolveBirthDeathDateForDisplay(p));
        m.put("imageUrl", p.getImageUrl());
        return m;
    }

    private Map<String, Object> schoolMap(School s) {
        Map<String, Object> m = new HashMap<>();
        String translatedNameEn = translationService.getSchoolDisplayName(s, "en");
        String translatedDescriptionEn = translationService.getSchoolDisplayDescription(s, "en");
        m.put("id", s.getId());
        m.put("name", s.getName());
        m.put("nameEn", translatedNameEn != null && !translatedNameEn.equals(s.getName()) ? translatedNameEn : null);
        m.put("description", s.getDescription());
        m.put("descriptionEn", translatedDescriptionEn != null && !translatedDescriptionEn.equals(s.getDescription()) ? translatedDescriptionEn : null);
        m.put("parentId", s.getParent() == null ? null : s.getParent().getId());
        return m;
    }

    private Map<String, Object> contentMap(Content c) {
        Map<String, Object> m = new HashMap<>();
        String translatedContentEn = translationService.getContentDisplayText(c, "en");
        m.put("id", c.getId());
        m.put("content", c.getContent());
        m.put("contentEn", translatedContentEn != null && !translatedContentEn.equals(c.getContent()) ? translatedContentEn : null);
        m.put("orderIndex", c.getOrderIndex());
        m.put("philosopherId", c.getPhilosopher() == null ? null : c.getPhilosopher().getId());
        m.put("philosopherName", c.getPhilosopher() == null ? null : c.getPhilosopher().getName());
        m.put("schoolId", c.getSchool() == null ? null : c.getSchool().getId());
        m.put("schoolName", c.getSchool() == null ? null : c.getSchool().getName());
        m.put("userId", c.getUser() == null ? null : c.getUser().getId());
        m.put("username", c.getUser() == null ? null : c.getUser().getUsername());
        return m;
    }

    private String nullIfBlank(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void savePhilosopherTranslation(Philosopher philosopher, String nameEnInput, String bioEnInput) {
        String nameEn = nullIfBlank(nameEnInput);
        String bioEn = nullIfBlank(bioEnInput);
        if (nameEn == null && bioEn == null) {
            translationService.deletePhilosopherTranslation(philosopher.getId(), "en");
            return;
        }

        String finalNameEn = nameEn;
        if (finalNameEn == null && bioEn != null) {
            // 兼容创建新翻译时 nameEn 必填限制
            finalNameEn = philosopher.getName();
        }
        translationService.savePhilosopherTranslation(philosopher.getId(), "en", finalNameEn, bioEn);
    }

    private void saveSchoolTranslation(School school, String nameEnInput, String descriptionEnInput) {
        String nameEn = nullIfBlank(nameEnInput);
        String descriptionEn = nullIfBlank(descriptionEnInput);
        if (nameEn == null && descriptionEn == null) {
            translationService.deleteSchoolTranslation(school.getId(), "en");
            return;
        }
        String finalNameEn = nameEn == null ? school.getName() : nameEn;
        translationService.saveSchoolTranslation(school.getId(), "en", finalNameEn, descriptionEn);
    }

    private void saveContentTranslation(Content content, String contentEnInput) {
        String contentEn = nullIfBlank(contentEnInput);
        if (contentEn == null) {
            translationService.deleteContentTranslation(content.getId(), "en");
            return;
        }
        translationService.saveContentTranslation(content.getId(), "en", contentEn);
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String parseAndApplyBirthDeathDate(Philosopher philosopher, String birthDeathDate) {
        String trimmed = nullIfBlank(birthDeathDate);
        if (trimmed == null) {
            return null;
        }
        Integer birthDateInt = DateUtils.parseBirthDateFromRange(trimmed);
        if (birthDateInt == null) {
            return "日期格式错误，请使用例如：1999.1.1 - 2000.1.1";
        }
        Integer deathDateInt = DateUtils.parseDeathYearFromRange(trimmed);
        philosopher.setBirthYear(birthDateInt);
        philosopher.setDeathYear(deathDateInt);
        return null;
    }

    private String resolveBirthDeathDateForDisplay(Philosopher philosopher) {
        String dateRange = DateUtils.formatBirthYearToDateRange(philosopher.getBirthYear(), philosopher.getDeathYear());
        if (dateRange != null && !dateRange.isBlank()) {
            return dateRange;
        }
        return null;
    }

    private long nullSafeId(Long id) {
        return id == null ? Long.MAX_VALUE : id;
    }

    private int compareByPinyin(String left, String right) {
        return pinyinComparator.compare(left, right);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(Authentication auth) {
        requireAdmin(auth);
        Map<String, Object> res = new HashMap<>();
        res.put("philosophersCount", philosopherService.countPhilosophers());
        res.put("schoolsCount", schoolService.countSchools());
        res.put("contentsCount", contentService.countContents());
        res.put("usersCount", userService.countUsers());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> listUsers(Authentication auth) {
        requireAdmin(auth);
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> list = users.stream().map(this::userMap).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("users", list));
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(Authentication auth, @RequestBody Map<String, Object> body) {
        requireAdmin(auth);
        String username = String.valueOf(body.getOrDefault("username", "")).trim();
        String email = String.valueOf(body.getOrDefault("email", "")).trim();
        String password = String.valueOf(body.getOrDefault("password", ""));
        if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "用户名、邮箱、密码不能为空"));
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "密码长度至少6位"));
        }
        if (userService.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "用户名已存在"));
        }
        if (userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "邮箱已存在"));
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(normalizeRole((String) body.get("role")));
        Boolean enabled = asBoolean(body.get("enabled"));
        user.setEnabled(enabled == null || enabled);
        user.setFirstName((String) body.get("firstName"));
        user.setLastName((String) body.get("lastName"));
        User saved = userService.registerNewUser(user);
        return ResponseEntity.ok(Map.of("success", true, "user", userMap(saved)));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin(auth);
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "用户不存在"));
        }
        String username = String.valueOf(body.getOrDefault("username", user.getUsername())).trim();
        String email = String.valueOf(body.getOrDefault("email", user.getEmail())).trim();
        if (!username.equals(user.getUsername()) && userService.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "用户名已存在"));
        }
        if (!email.equals(user.getEmail()) && userService.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "邮箱已存在"));
        }
        user.setUsername(username);
        user.setEmail(email);
        user.setRole(normalizeRole((String) body.getOrDefault("role", user.getRole())));
        Boolean enabled = asBoolean(body.get("enabled"));
        if (enabled != null) {
            user.setEnabled(enabled);
        }
        user.setFirstName((String) body.getOrDefault("firstName", user.getFirstName()));
        user.setLastName((String) body.getOrDefault("lastName", user.getLastName()));
        User saved = userService.saveUser(user);
        return ResponseEntity.ok(Map.of("success", true, "user", userMap(saved)));
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<Map<String, Object>> updateUserPassword(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        requireAdmin(auth);
        User user = userService.getUserById(id);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "用户不存在"));
        }
        String newPassword = String.valueOf(body.getOrDefault("password", ""));
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "密码长度至少6位"));
        }
        userService.updatePassword(id, newPassword);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(Authentication auth, @PathVariable Long id) {
        requireAdmin(auth);
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/philosophers")
    public ResponseEntity<Map<String, Object>> listPhilosophers(Authentication auth) {
        requireAdmin(auth);
        List<Philosopher> list = philosopherService.getAllPhilosophers();
        list.sort((left, right) -> {
            int byName = compareByPinyin(left == null ? null : left.getName(), right == null ? null : right.getName());
            if (byName != 0) {
                return byName;
            }
            return Long.compare(nullSafeId(left == null ? null : left.getId()), nullSafeId(right == null ? null : right.getId()));
        });
        return ResponseEntity.ok(Map.of("philosophers", list.stream().map(this::philosopherMap).toList()));
    }

    @PostMapping("/philosophers")
    public ResponseEntity<Map<String, Object>> createPhilosopher(Authentication auth, @RequestBody Map<String, Object> body) {
        User adminUser = requireAdminUser(auth);
        String name = String.valueOf(body.getOrDefault("name", "")).trim();
        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "哲学家姓名不能为空"));
        }
        Philosopher p = new Philosopher();
        p.setName(name);
        p.setNameEn((String) body.get("nameEn"));
        p.setBio((String) body.get("bio"));
        p.setBioEn((String) body.get("bioEn"));
        p.setImageUrl((String) body.get("imageUrl"));
        String birthDeathDateError = parseAndApplyBirthDeathDate(p, asString(body.get("birthDeathDate")));
        if (birthDeathDateError != null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", birthDeathDateError));
        }
        if (p.getBirthYear() == null) {
            p.setBirthYear(asInteger(body.get("birthYear")));
            p.setDeathYear(asInteger(body.get("deathYear")));
        }
        Philosopher saved = philosopherService.savePhilosopherForAdmin(p, adminUser);
        savePhilosopherTranslation(saved, (String) body.get("nameEn"), (String) body.get("bioEn"));
        return ResponseEntity.ok(Map.of("success", true, "philosopher", philosopherMap(saved)));
    }

    @PutMapping("/philosophers/{id}")
    public ResponseEntity<Map<String, Object>> updatePhilosopher(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        User adminUser = requireAdminUser(auth);
        Philosopher p = philosopherService.getPhilosopherById(id);
        if (p == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "哲学家不存在"));
        }
        String name = String.valueOf(body.getOrDefault("name", p.getName())).trim();
        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "哲学家姓名不能为空"));
        }
        p.setName(name);
        p.setNameEn((String) body.getOrDefault("nameEn", p.getNameEn()));
        p.setBio((String) body.getOrDefault("bio", p.getBio()));
        p.setBioEn((String) body.getOrDefault("bioEn", p.getBioEn()));
        p.setImageUrl((String) body.getOrDefault("imageUrl", p.getImageUrl()));
        String birthDeathDateError = parseAndApplyBirthDeathDate(p, asString(body.get("birthDeathDate")));
        if (birthDeathDateError != null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", birthDeathDateError));
        }
        if (body.containsKey("birthYear") || body.containsKey("deathYear")) {
            p.setBirthYear(asInteger(body.getOrDefault("birthYear", p.getBirthYear())));
            p.setDeathYear(asInteger(body.getOrDefault("deathYear", p.getDeathYear())));
        }
        Philosopher saved = philosopherService.savePhilosopherForAdmin(p, adminUser);
        savePhilosopherTranslation(saved, (String) body.get("nameEn"), (String) body.get("bioEn"));
        return ResponseEntity.ok(Map.of("success", true, "philosopher", philosopherMap(saved)));
    }

    @DeleteMapping("/philosophers/{id}")
    public ResponseEntity<Map<String, Object>> deletePhilosopher(Authentication auth, @PathVariable Long id) {
        requireAdmin(auth);
        philosopherService.deletePhilosopher(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/schools")
    public ResponseEntity<Map<String, Object>> listSchools(Authentication auth) {
        requireAdmin(auth);
        List<School> list = schoolService.getAllSchools();
        list.sort((left, right) -> {
            int byName = compareByPinyin(left == null ? null : left.getName(), right == null ? null : right.getName());
            if (byName != 0) {
                return byName;
            }
            return Long.compare(nullSafeId(left == null ? null : left.getId()), nullSafeId(right == null ? null : right.getId()));
        });
        return ResponseEntity.ok(Map.of("schools", list.stream().map(this::schoolMap).toList()));
    }

    @PostMapping("/schools")
    public ResponseEntity<Map<String, Object>> createSchool(Authentication auth, @RequestBody Map<String, Object> body) {
        User adminUser = requireAdminUser(auth);
        String name = String.valueOf(body.getOrDefault("name", "")).trim();
        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "流派名称不能为空"));
        }
        School school = new School();
        school.setName(name);
        school.setNameEn((String) body.get("nameEn"));
        school.setDescription((String) body.get("description"));
        school.setDescriptionEn((String) body.get("descriptionEn"));
        Long parentId = asLong(body.get("parentId"));
        if (parentId != null) {
            school.setParent(schoolService.getSchoolById(parentId));
        }
        School saved = schoolService.saveSchoolForAdmin(school, adminUser);
        saveSchoolTranslation(saved, (String) body.get("nameEn"), (String) body.get("descriptionEn"));
        return ResponseEntity.ok(Map.of("success", true, "school", schoolMap(saved)));
    }

    @PutMapping("/schools/{id}")
    public ResponseEntity<Map<String, Object>> updateSchool(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        User adminUser = requireAdminUser(auth);
        School school = schoolService.getSchoolById(id);
        if (school == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "流派不存在"));
        }
        school.setName(String.valueOf(body.getOrDefault("name", school.getName())).trim());
        school.setNameEn((String) body.getOrDefault("nameEn", school.getNameEn()));
        school.setDescription((String) body.getOrDefault("description", school.getDescription()));
        school.setDescriptionEn((String) body.getOrDefault("descriptionEn", school.getDescriptionEn()));
        Long parentId = asLong(body.get("parentId"));
        if (parentId == null || parentId.equals(id)) {
            school.setParent(null);
        } else {
            school.setParent(schoolService.getSchoolById(parentId));
        }
        School saved = schoolService.saveSchoolForAdmin(school, adminUser);
        saveSchoolTranslation(saved, (String) body.get("nameEn"), (String) body.get("descriptionEn"));
        return ResponseEntity.ok(Map.of("success", true, "school", schoolMap(saved)));
    }

    @DeleteMapping("/schools/{id}")
    public ResponseEntity<Map<String, Object>> deleteSchool(Authentication auth, @PathVariable Long id) {
        requireAdmin(auth);
        schoolService.deleteSchool(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/contents")
    public ResponseEntity<Map<String, Object>> listContents(Authentication auth) {
        requireAdmin(auth);
        List<Content> list = contentService.getAllContents();
        list.sort((left, right) -> {
            int byPhilosopher = compareByPinyin(
                left != null && left.getPhilosopher() != null ? left.getPhilosopher().getName() : null,
                right != null && right.getPhilosopher() != null ? right.getPhilosopher().getName() : null
            );
            if (byPhilosopher != 0) {
                return byPhilosopher;
            }

            int bySchool = compareByPinyin(
                left != null && left.getSchool() != null ? left.getSchool().getName() : null,
                right != null && right.getSchool() != null ? right.getSchool().getName() : null
            );
            if (bySchool != 0) {
                return bySchool;
            }

            int byContent = compareByPinyin(left == null ? null : left.getContent(), right == null ? null : right.getContent());
            if (byContent != 0) {
                return byContent;
            }

            return Long.compare(nullSafeId(left == null ? null : left.getId()), nullSafeId(right == null ? null : right.getId()));
        });
        return ResponseEntity.ok(Map.of("contents", list.stream().map(this::contentMap).toList()));
    }

    @PostMapping("/contents")
    public ResponseEntity<Map<String, Object>> createContent(Authentication auth, @RequestBody Map<String, Object> body) {
        User adminUser = requireAdminUser(auth);
        String contentText = String.valueOf(body.getOrDefault("content", "")).trim();
        if (contentText.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "内容不能为空"));
        }
        Content content = new Content();
        content.setContent(contentText);
        content.setContentEn((String) body.get("contentEn"));
        content.setOrderIndex(asInteger(body.get("orderIndex")));
        Long philosopherId = asLong(body.get("philosopherId"));
        if (philosopherId != null) {
            content.setPhilosopher(philosopherService.getPhilosopherById(philosopherId));
        }
        Long schoolId = asLong(body.get("schoolId"));
        if (schoolId != null) {
            content.setSchool(schoolService.getSchoolById(schoolId));
        }
        Content saved = contentService.saveContentForAdmin(content, adminUser);
        saveContentTranslation(saved, (String) body.get("contentEn"));
        return ResponseEntity.ok(Map.of("success", true, "content", contentMap(saved)));
    }

    @PutMapping("/contents/{id}")
    public ResponseEntity<Map<String, Object>> updateContent(Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body) {
        User adminUser = requireAdminUser(auth);
        Content content = contentService.getContentById(id);
        if (content == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "内容不存在"));
        }
        content.setContent((String) body.getOrDefault("content", content.getContent()));
        content.setContentEn((String) body.getOrDefault("contentEn", content.getContentEn()));
        content.setOrderIndex(asInteger(body.getOrDefault("orderIndex", content.getOrderIndex())));
        Long philosopherId = asLong(body.get("philosopherId"));
        content.setPhilosopher(philosopherId == null ? null : philosopherService.getPhilosopherById(philosopherId));
        Long schoolId = asLong(body.get("schoolId"));
        content.setSchool(schoolId == null ? null : schoolService.getSchoolById(schoolId));
        Content saved = contentService.saveContentForAdmin(content, adminUser);
        saveContentTranslation(saved, (String) body.get("contentEn"));
        return ResponseEntity.ok(Map.of("success", true, "content", contentMap(saved)));
    }

    @DeleteMapping("/contents/{id}")
    public ResponseEntity<Map<String, Object>> deleteContent(Authentication auth, @PathVariable Long id) {
        requireAdmin(auth);
        contentService.deleteContent(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping(value = "/data-import/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadCsv(
        Authentication auth,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "clearExistingData", defaultValue = "false") boolean clearExistingData
    ) {
        requireAdmin(auth);
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "请选择CSV文件"));
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "只支持CSV文件"));
        }
        DataImportService.ImportResult result = dataImportService.importCsvData(file, clearExistingData);
        Map<String, Object> res = new HashMap<>();
        res.put("success", result.isSuccess());
        res.put("message", result.getMessage());
        res.put("results", result.getResults());
        res.put("totalImported", result.getTotalImported());
        res.put("totalFailed", result.getTotalFailed());
        res.put("failureDetails", result.getFailureDetails());
        return result.isSuccess() ? ResponseEntity.ok(res) : ResponseEntity.badRequest().body(res);
    }

    @PostMapping("/data-import/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllData(Authentication auth) {
        requireAdmin(auth);
        Map<String, Long> before = dataImportService.collectClearDataSummary();
        dataImportService.clearAllDataSafely();
        Map<String, Long> after = dataImportService.collectClearDataSummary();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "数据库数据已清空",
            "before", before,
            "after", after
        ));
    }

    @GetMapping("/data-export/download")
    public ResponseEntity<byte[]> downloadCsv(Authentication auth) {
        requireAdmin(auth);
        String csvData = dataExportService.exportAllDataToCsv();

        byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] csvBytes = csvData.getBytes(StandardCharsets.UTF_8);
        byte[] csvBytesWithBom = new byte[bom.length + csvBytes.length];
        System.arraycopy(bom, 0, csvBytesWithBom, 0, bom.length);
        System.arraycopy(csvBytes, 0, csvBytesWithBom, bom.length, csvBytes.length);

        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String filename = "philosophy_data_export_" + timestamp + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        headers.setCacheControl("no-cache, no-store, must-revalidate");

        return ResponseEntity.ok()
            .headers(headers)
            .body(csvBytesWithBom);
    }

    /**
     * 发送 CSV 数据文件到管理员邮箱
     */
    @PostMapping("/data-export/send-email")
    public ResponseEntity<Map<String, Object>> sendCsvToEmail(Authentication auth) {
        User adminUser = requireAdminUser(auth);
        String toEmail = adminUser.getEmail();
        if (toEmail == null || toEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "管理员账号未绑定邮箱，无法发送"));
        }
        try {
            String csvData = dataExportService.exportAllDataToCsv();
            byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
            byte[] csvBytes = csvData.getBytes(StandardCharsets.UTF_8);
            byte[] csvBytesWithBom = new byte[bom.length + csvBytes.length];
            System.arraycopy(bom, 0, csvBytesWithBom, 0, bom.length);
            System.arraycopy(csvBytes, 0, csvBytesWithBom, bom.length, csvBytes.length);

            String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
            String filename = "philosophy_data_export_" + timestamp + ".csv";
            String subject = "哲学网站数据导出 - " + timestamp;
            String htmlContent = "<p>您好，</p><p>这是您请求的哲学网站数据导出 CSV 文件，请查收附件。</p>";

            emailService.sendReportWithAttachment(toEmail, subject, htmlContent, csvBytesWithBom, filename);
            return ResponseEntity.ok(Map.of("success", true, "message", "CSV 文件已发送至 " + toEmail));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "发送邮件失败: " + e.getMessage()));
        }
    }
}
