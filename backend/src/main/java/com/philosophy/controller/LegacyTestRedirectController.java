package com.philosophy.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LegacyTestRedirectController {

    @Value("${app.frontend.url:}")
    private String frontendUrl;

    private String frontendBase() {
        return (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
    }

    private String redirectTo(String path) {
        return "redirect:" + frontendBase() + path;
    }

    @GetMapping({"/tests", "/test"})
    public String tests() {
        return redirectTo("/tests");
    }

    @GetMapping({"/mmpi", "/MMPI", "/Mmpi"})
    public String mmpi() {
        return redirectTo("/tests/mmpi");
    }

    @GetMapping({"/mbti", "/MBTI", "/Mbti"})
    public String mbti() {
        return redirectTo("/tests/mbti");
    }

    @GetMapping({"/enneagram", "/Enneagram"})
    public String enneagram() {
        return redirectTo("/tests/enneagram");
    }

    @GetMapping({"/bigfive", "/big-five", "/BigFive", "/Bigfive"})
    public String bigfive() {
        return redirectTo("/tests/bigfive");
    }

    @GetMapping({"/values8", "/values-8", "/8values", "/eightvalues"})
    public String values8() {
        return redirectTo("/tests/values8");
    }
}
