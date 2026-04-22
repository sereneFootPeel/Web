package com.philosophy.security;

import com.philosophy.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "change-this-jwt-secret-to-a-long-random-string-32-bytes-minimum";

    @Test
    void generateTokenAndValidateRoundTrip() {
        JwtService jwtService = new JwtService(SECRET, 3600);
        jwtService.validateConfig();

        User user = new User();
        user.setUsername("alice");
        user.setRole("ADMIN");

        String token = jwtService.generateToken(user);

        assertEquals("alice", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, user));
        assertEquals(3600, jwtService.getAccessTokenExpirationSeconds());
    }
}

