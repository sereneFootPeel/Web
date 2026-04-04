package com.philosophy.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@Controller
public class ErrorController implements org.springframework.boot.web.servlet.error.ErrorController {

    private static final Logger logger = LoggerFactory.getLogger(ErrorController.class);

    @Value("${app.frontend.url:}")
    private String frontendUrl;

    private String frontendBase() {
        return (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
    }

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request) {
        Object status = request.getAttribute("jakarta.servlet.error.status_code");
        Object message = request.getAttribute("jakarta.servlet.error.message");
        Object exception = request.getAttribute("jakarta.servlet.error.exception");
        String requestUri = String.valueOf(request.getAttribute("jakarta.servlet.error.request_uri"));
        
        int statusCode = 500; // Default to 500
        try {
            if (status != null) {
                statusCode = Integer.parseInt(status.toString());
            }
        } catch (NumberFormatException e) {
            logger.error("Failed to parse status code: {}", status, e);
        }
        
        String errorMessage = message != null ? message.toString() : "服务器内部错误";
        
        if (exception != null) {
            Throwable throwable = (Throwable) exception;
            errorMessage = throwable.getMessage() != null ? throwable.getMessage() : errorMessage;
            logger.error("Error occurred: Status={}, Message={}", statusCode, errorMessage, throwable);
        }

        if (requestUri != null && requestUri.startsWith("/api/")) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("status", statusCode);
            body.put("message", errorMessage);
            return ResponseEntity.status(statusCode)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body);
        }

        return ResponseEntity.status(302)
                .header(HttpHeaders.LOCATION, frontendBase() + "/?error=" + statusCode)
                .build();
    }
}