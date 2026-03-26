package com.philosophy.controller;

import com.philosophy.model.Comment;
import com.philosophy.model.Content;
import com.philosophy.model.School;
import com.philosophy.model.User;
import com.philosophy.model.UserContentEdit;
import com.philosophy.service.CommentService;
import com.philosophy.service.ContentService;
import com.philosophy.service.SchoolService;
import com.philosophy.service.TranslationService;
import com.philosophy.service.UserContentEditService;
import com.philosophy.service.UserService;
import com.philosophy.util.LanguageUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
public class UserProfileController {

    private final UserService userService;
    private final CommentService commentService;
    private final TranslationService translationService;
    private final ContentService contentService;
    private final UserContentEditService userContentEditService;
    private final SchoolService schoolService;
    private final LanguageUtil languageUtil;

    public UserProfileController(UserService userService,
                                 CommentService commentService,
                                 TranslationService translationService,
                                 ContentService contentService,
                                 UserContentEditService userContentEditService,
                                 SchoolService schoolService,
                                 LanguageUtil languageUtil) {
        this.userService = userService;
        this.commentService = commentService;
        this.translationService = translationService;
        this.contentService = contentService;
        this.userContentEditService = userContentEditService;
        this.schoolService = schoolService;
        this.languageUtil = languageUtil;
    }

    // 管理员界面查看用户详情（保留：管理员面板页面）
    @GetMapping("/admin/users/view/{id}")
    public String viewUserDetails(@PathVariable Long id, Model model, Authentication authentication, HttpServletRequest request) {
        User user = userService.getUserById(id);
        if (user == null) {
            return "redirect:/admin/users";
        }

        String language = languageUtil.getLanguage(request);

        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated()) {
            currentUser = userService.findByUsername(authentication.getName());
        }

        boolean isAdmin = authentication != null && authentication.isAuthenticated() &&
                authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && !(authentication instanceof AnonymousAuthenticationToken);

        List<Comment> comments = commentService.findByUserIdWithPrivacyFilter(id, currentUser);
        long commentCount = commentService.countByUserId(id);

        List<UserContentEdit> userEdits = userContentEditService.getUserEdits(id, org.springframework.data.domain.PageRequest.of(0, 20)).getContent();
        long userEditCount = userContentEditService.getUserEditCount(id);

        List<Content> moderatorContents = null;
        long moderatorContentCount = 0;
        if (user.getRole() != null && user.getRole().equals("MODERATOR")) {
            moderatorContents = contentService.getContentsByUserId(id);
            moderatorContentCount = contentService.countContentsByUserId(id);
        }

        List<School> allSchools = schoolService.getAllSchools();

        model.addAttribute("user", user);
        model.addAttribute("comments", comments);
        model.addAttribute("commentCount", commentCount);
        model.addAttribute("userEdits", userEdits);
        model.addAttribute("userEditCount", userEditCount);
        model.addAttribute("moderatorContents", moderatorContents);
        model.addAttribute("moderatorContentCount", moderatorContentCount);
        model.addAttribute("isAdmin", isAdmin);
        model.addAttribute("allSchools", allSchools);
        model.addAttribute("language", language);
        model.addAttribute("translationService", translationService);
        model.addAttribute("isAuthenticated", isAuthenticated);
        model.addAttribute("userService", userService);
        model.addAttribute("schoolService", schoolService);

        return "admin/users/view";
    }
}

