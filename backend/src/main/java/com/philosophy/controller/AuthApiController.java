package com.philosophy.controller;

import com.philosophy.model.User;
import com.philosophy.service.UserService;
import com.philosophy.service.VerificationCodeService;
import com.philosophy.service.EmailService;
import com.philosophy.service.RateLimitingService;
import com.philosophy.security.JwtService;
import com.philosophy.util.LanguageUtil;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
    private final UserService userService;
    private final VerificationCodeService verificationCodeService;
    private final EmailService emailService;
    private final RateLimitingService rateLimitingService;
    private final LanguageUtil languageUtil;
    private final JwtService jwtService;

    public AuthApiController(org.springframework.security.authentication.AuthenticationManager authenticationManager,
                             UserService userService,
                             VerificationCodeService verificationCodeService,
                             EmailService emailService,
                             RateLimitingService rateLimitingService,
                             LanguageUtil languageUtil,
                             JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.verificationCodeService = verificationCodeService;
        this.emailService = emailService;
        this.rateLimitingService = rateLimitingService;
        this.languageUtil = languageUtil;
        this.jwtService = jwtService;
    }

    @PostMapping("/send-code")
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = body != null ? body.get("email") : null;
        Map<String, Object> res = new HashMap<>();
        if (email == null || email.isBlank()) {
            res.put("success", false);
            res.put("message", "邮箱不能为空");
            return ResponseEntity.badRequest().body(res);
        }
        String clientIp = getClientIp(request);
        RateLimitingService.RateLimitResult r = rateLimitingService.checkRateLimit(clientIp);
        if (!r.isAllowed()) {
            res.put("success", false);
            res.put("message", "请求过于频繁，请" + r.getWaitSeconds() + "秒后再试");
            return ResponseEntity.status(429).body(res);
        }
        if (userService.existsByEmail(email)) {
            res.put("success", false);
            res.put("message", "该邮箱已被注册");
            return ResponseEntity.badRequest().body(res);
        }
        try {
            String code = verificationCodeService.generateAndStoreCode(email);
            emailService.sendVerificationCode(email, code);
            long cooldown = verificationCodeService.getSecondsUntilResendAllowed(email);
            res.put("success", true);
            res.put("cooldown", cooldown);
            return ResponseEntity.ok(res);
        } catch (IllegalStateException e) {
            res.put("success", false);
            res.put("message", "请稍后再试");
            return ResponseEntity.status(429).body(res);
        } catch (Exception e) {
            res.put("success", false);
            res.put("message", "发送失败，请稍后再试");
            return ResponseEntity.status(500).body(res);
        }
    }

    private String getClientIp(HttpServletRequest req) {
        String ip = req.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = req.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty()) ip = req.getRemoteAddr();
        return ip != null ? ip : "unknown";
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body,
                                                     HttpServletRequest request,
                                                     HttpServletResponse response) {
        String username = body.get("username");
        String password = body.get("password");
        Map<String, Object> res = new HashMap<>();

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            res.put("success", false);
            res.put("message", "用户名和密码不能为空");
            return ResponseEntity.badRequest().body(res);
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));
            SecurityContextHolder.getContext().setAuthentication(auth);

            User user = userService.findByUsername(username);
            syncLanguagePreference(user, request, response);
            res.put("success", true);
            res.put("token", jwtService.generateToken(user));
            res.put("tokenType", "Bearer");
            res.put("expiresIn", jwtService.getAccessTokenExpirationSeconds());
            res.put("user", toUserDto(user));
            return ResponseEntity.ok(res);
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            res.put("success", false);
            res.put("message", "用户名或密码错误");
            return ResponseEntity.status(401).body(res);
        }
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, Object>> csrf() {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "JWT auth enabled; CSRF token is not required for /api requests");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication auth,
                                                  HttpServletRequest request,
                                                  HttpServletResponse response) {
        Map<String, Object> res = new HashMap<>();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            res.put("authenticated", false);
            return ResponseEntity.ok(res);
        }
        Object principal = auth.getPrincipal();
        User user = principal instanceof User ? (User) principal : userService.findByUsername(auth.getName());
        if (user == null) {
            res.put("authenticated", false);
            return ResponseEntity.ok(res);
        }
        syncLanguagePreference(user, request, response);
        res.put("authenticated", true);
        res.put("user", toUserDto(user));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        SecurityContextHolder.clearContext();
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body,
                                                        HttpServletRequest request,
                                                        HttpServletResponse response) {
        Map<String, Object> res = new HashMap<>();
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String code = body.get("verificationCode");

        if (username == null || username.isBlank()) {
            res.put("success", false);
            res.put("message", "用户名不能为空");
            return ResponseEntity.badRequest().body(res);
        }
        if (email == null || email.isBlank()) {
            res.put("success", false);
            res.put("message", "邮箱不能为空");
            return ResponseEntity.badRequest().body(res);
        }
        if (password == null || password.length() < 6) {
            res.put("success", false);
            res.put("message", "密码长度至少6位");
            return ResponseEntity.badRequest().body(res);
        }
        if (code == null || code.isBlank()) {
            res.put("success", false);
            res.put("message", "验证码不能为空");
            return ResponseEntity.badRequest().body(res);
        }

        if (!verificationCodeService.verifyCode(email, code)) {
            res.put("success", false);
            res.put("message", "验证码错误或已失效");
            return ResponseEntity.badRequest().body(res);
        }

        if (userService.existsByUsername(username)) {
            res.put("success", false);
            res.put("message", "用户名已被注册");
            return ResponseEntity.badRequest().body(res);
        }
        if (userService.existsByEmail(email)) {
            res.put("success", false);
            res.put("message", "邮箱已被注册");
            return ResponseEntity.badRequest().body(res);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole("USER");
        User saved = userService.registerNewUser(user);
        syncLanguagePreference(saved, request, response);
        res.put("success", true);
        res.put("message", "注册成功");
        res.put("token", jwtService.generateToken(saved));
        res.put("tokenType", "Bearer");
        res.put("expiresIn", jwtService.getAccessTokenExpirationSeconds());
        res.put("user", toUserDto(saved));
        return ResponseEntity.ok(res);
    }

    private void syncLanguagePreference(User user,
                                        HttpServletRequest request,
                                        HttpServletResponse response) {
        if (user == null || request == null || response == null) {
            return;
        }
        String language = user.getLanguage();
        if (!"en".equals(language) && !"zh".equals(language)) {
            language = languageUtil.getLanguage(request);
            user.setLanguage(language);
            userService.updateUser(user);
        }

        Cookie languageCookie = new Cookie("philosophy_language", language);
        languageCookie.setPath("/");
        languageCookie.setMaxAge(30 * 24 * 60 * 60);
        response.addCookie(languageCookie);
    }

    private Map<String, Object> toUserDto(User u) {
        Map<String, Object> dto = new HashMap<>();
        if (u == null) return dto;
        dto.put("id", u.getId());
        dto.put("username", u.getUsername());
        dto.put("email", u.getEmail());
        dto.put("role", u.getRole());
        dto.put("firstName", u.getFirstName());
        dto.put("lastName", u.getLastName());
        dto.put("language", u.getLanguage());
        dto.put("theme", u.getTheme());
        return dto;
    }
}
