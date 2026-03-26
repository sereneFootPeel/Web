package com.philosophy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.core.Ordered;
import jakarta.servlet.Filter;
import com.philosophy.security.DeviceIdFilter;
import com.philosophy.security.CustomAuthenticationFailureHandler;
import org.springframework.http.HttpMethod;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.philosophy.model.User;
import com.philosophy.service.IpLocationService;
import com.philosophy.util.LanguageUtil;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
    
    private final com.philosophy.service.UserService userService;
    private final CustomAuthenticationFailureHandler customAuthenticationFailureHandler;
    private final IpLocationService ipLocationService;
    private final LanguageUtil languageUtil;
    
    public SecurityConfig(com.philosophy.service.UserService userService,
                          CustomAuthenticationFailureHandler customAuthenticationFailureHandler,
                          IpLocationService ipLocationService,
                          LanguageUtil languageUtil) {
        this.userService = userService;
        this.customAuthenticationFailureHandler = customAuthenticationFailureHandler;
        this.ipLocationService = ipLocationService;
        this.languageUtil = languageUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        logger.info("Configuring security filters");
        
        http
            .cors(cors -> {})
            // 禁用CSRF保护以便于测试（API + SPA）
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**", "/admin/data-import/upload")
            )
            // 添加请求日志记录过滤器
            .addFilterBefore((request, response, chain) -> {
                HttpServletRequest httpRequest = (HttpServletRequest) request;
                String uri = httpRequest.getRequestURI();
                String method = httpRequest.getMethod();
                logger.info("Incoming request: {} {}", method, uri);
                
                chain.doFilter(request, response);
            }, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authorize -> authorize
                // 公开的随机名句API
                .requestMatchers(HttpMethod.GET, "/api/quotes/random").permitAll()
                // 健康检查
                .requestMatchers("/api/health").permitAll()
                // 认证相关API
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/send-code").permitAll()
                .requestMatchers("/api/auth/me").permitAll()
                // 允许所有用户访问的API（SPA 前端调用）
                .requestMatchers("/api/schools/**", "/api/philosophers/**", "/api/search/**", "/api/contents/**").permitAll()
                // 点赞 API：公开读取，写操作需认证
                .requestMatchers(HttpMethod.GET, "/api/likes/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/likes/toggle").authenticated()
                // 评论API：GET 公开，POST 需认证
                .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/comments/content/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/comments/*").authenticated()
                // 静态资源
                .requestMatchers("/css/**", "/js/**", "/images/**", "/uploads/**", "/data/**", "/error", "/language/**", "/@vite/**", "/node_modules/**").permitAll()
                // 允许访问Vite相关资源
                // 用户相关API需要认证
                // 用户相关API需要认证
                .requestMatchers("/api/user/**").authenticated()
                // 管理后台API需要ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 测试结果保存/可见性/删除需认证
                .requestMatchers("/api/test-results", "/api/test-results/**").authenticated()
                // 管理员页面需要ADMIN角色
                .requestMatchers("/admin/**").hasRole("ADMIN")
                // 其他所有请求都需要认证
                .anyRequest().authenticated()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .deleteCookies("remember-me")
                .permitAll()
            )
            // 记住我：勾选后登录状态保持 24 小时（1 天），关闭浏览器后仍有效
            .rememberMe(remember -> remember
                .key("philosophy-remember-me-key")
                .tokenValiditySeconds(86400)
            );
        
        return http.build();
    }

    @Bean
    public FilterRegistrationBean<Filter> deviceIdFilterRegistration(DeviceIdFilter deviceIdFilter) {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(deviceIdFilter);
        registration.addUrlPatterns("/*");
        registration.setName("deviceIdFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    // Remove the deprecated authenticationProvider() method as it's no longer needed
    // Spring Security will automatically configure DaoAuthenticationProvider
    // when UserDetailsService and PasswordEncoder beans are available

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            try {
                User user = (User) authentication.getPrincipal();
                
                // 从数据库读取用户的语言偏好并设置到Session和Cookie
                try {
                    String userLanguage = user.getLanguage();
                    
                    // 如果用户没有设置语言偏好，根据IP地址判断默认语言
                    if (userLanguage == null || userLanguage.trim().isEmpty()) {
                        boolean isForeign = ipLocationService.isForeignIp(request);
                        userLanguage = isForeign ? "en" : "zh";
                        
                        // 保存到数据库
                        user.setLanguage(userLanguage);
                        userService.updateUser(user);
                        
                        logger.info("User {} 没有语言偏好，根据IP地址设置默认语言: {} (IP是否国外: {})", 
                                    user.getUsername(), userLanguage, isForeign);
                    }
                    
                    // 设置到Session
                    request.getSession().setAttribute("language", userLanguage);
                    
                    // 设置到Cookie
                    jakarta.servlet.http.Cookie languageCookie = new jakarta.servlet.http.Cookie("philosophy_language", userLanguage);
                    languageCookie.setPath("/");
                    languageCookie.setMaxAge(30 * 24 * 60 * 60); // 30天
                    response.addCookie(languageCookie);
                    
                    logger.info("User {} language preference loaded: {}", user.getUsername(), userLanguage);
                } catch (Exception e) {
                    logger.error("Failed to load user language preference", e);
                    // 如果出错，使用工具类获取默认语言
                    try {
                        String defaultLanguage = languageUtil.getLanguage(request);
                        request.getSession().setAttribute("language", defaultLanguage);
                    } catch (Exception ex) {
                        logger.error("Failed to set default language", ex);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to record user login info", e);
            }
            
            // 检查是否有重定向参数
            String redirectUrl = request.getParameter("redirect");
            if (redirectUrl != null && !redirectUrl.isEmpty()) {
                response.sendRedirect(redirectUrl);
                return;
            }

            // 无论角色，默认重定向到首页，保持与普通用户一致
            response.sendRedirect("/");
        };
    }
}