package com.philosophy.controller;

import com.philosophy.model.User;
import com.philosophy.security.JwtService;
import com.philosophy.service.EmailService;
import com.philosophy.service.RateLimitingService;
import com.philosophy.service.UserService;
import com.philosophy.service.VerificationCodeService;
import com.philosophy.util.LanguageUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthApiControllerJwtTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserService userService;
    @Mock
    private VerificationCodeService verificationCodeService;
    @Mock
    private EmailService emailService;
    @Mock
    private RateLimitingService rateLimitingService;
    @Mock
    private LanguageUtil languageUtil;
    @Mock
    private JwtService jwtService;

    private AuthApiController controller;

    @BeforeEach
    void setUp() {
        controller = new AuthApiController(authenticationManager, userService, verificationCodeService, emailService, rateLimitingService, languageUtil, jwtService);
    }

    @Test
    void loginReturnsJwtAndUserPayload() {
        User user = new User();
        user.setId(1L);
        user.setUsername("alice");
        user.setEmail("alice@example.com");
        user.setRole("USER");
        user.setLanguage("en");

        when(authenticationManager.authenticate(any())).thenReturn(new TestingAuthenticationToken(user, null, "ROLE_USER"));
        when(userService.findByUsername("alice")).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);

        MockHttpServletResponse response = new MockHttpServletResponse();
        ResponseEntity<Map<String, Object>> result = controller.login(Map.of("username", "alice", "password", "secret123"), new MockHttpServletRequest(), response);

        assertEquals(200, result.getStatusCode().value());
        Map<String, Object> body = result.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));
        assertEquals("jwt-token", body.get("token"));
        assertEquals("Bearer", body.get("tokenType"));
        assertEquals(3600L, body.get("expiresIn"));
        assertNotNull(body.get("user"));
        assertTrue(response.getCookies().length > 0);
    }

    @Test
    void registerReturnsJwtForNewUser() {
        User saved = new User();
        saved.setId(2L);
        saved.setUsername("new-user");
        saved.setEmail("new@example.com");
        saved.setRole("USER");
        saved.setLanguage("zh");

        when(verificationCodeService.verifyCode("new@example.com", "123456")).thenReturn(true);
        when(userService.existsByUsername("new-user")).thenReturn(false);
        when(userService.existsByEmail("new@example.com")).thenReturn(false);
        when(userService.registerNewUser(any(User.class))).thenReturn(saved);
        when(jwtService.generateToken(saved)).thenReturn("register-jwt");
        when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(7200L);

        MockHttpServletResponse response = new MockHttpServletResponse();
        ResponseEntity<Map<String, Object>> result = controller.register(Map.of(
            "username", "new-user",
            "email", "new@example.com",
            "password", "secret123",
            "verificationCode", "123456"
        ), new MockHttpServletRequest(), response);

        assertEquals(200, result.getStatusCode().value());
        Map<String, Object> body = result.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));
        assertEquals("register-jwt", body.get("token"));
        assertEquals(7200L, body.get("expiresIn"));
        assertEquals("注册成功", body.get("message"));
        assertTrue(response.getCookies().length > 0);
    }
}

