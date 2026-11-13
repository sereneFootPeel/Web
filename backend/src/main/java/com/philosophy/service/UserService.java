package com.philosophy.service;

import com.philosophy.model.User;
import com.philosophy.model.Comment;
import com.philosophy.model.Content;
import com.philosophy.model.Like;
import com.philosophy.model.UserContentEdit;
import com.philosophy.model.Philosopher;
import com.philosophy.repository.UserRepository;
import com.philosophy.repository.CommentRepository;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.LikeRepository;
import com.philosophy.repository.UserContentEditRepository;
import com.philosophy.repository.PhilosopherRepository;
import com.philosophy.util.SearchNormalizer;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CommentRepository commentRepository;
    private final ContentRepository contentRepository;
    private final LikeRepository likeRepository;
    private final UserContentEditRepository userContentEditRepository;
    private final PhilosopherRepository philosopherRepository;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                      CommentRepository commentRepository,
                      ContentRepository contentRepository,
                      LikeRepository likeRepository, UserContentEditRepository userContentEditRepository,
                      PhilosopherRepository philosopherRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.commentRepository = commentRepository;
        this.contentRepository = contentRepository;
        this.likeRepository = likeRepository;
        this.userContentEditRepository = userContentEditRepository;
        this.philosopherRepository = philosopherRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Transactional
    public User registerNewUser(User user) {
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 角色兜底：只允许 USER/ADMIN，其他一律降级为 USER
        String role = (user.getRole() == null) ? "USER" : user.getRole().trim();
        if (!"USER".equals(role) && !"ADMIN".equals(role)) {
            role = "USER";
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    @Transactional
    public void updatePassword(Long userId, String rawPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));
        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }

    @Transactional
    public void createAdminAccount() {
        // 检查是否已有管理员账户
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("000000000000000000000000"));
            admin.setRole("ADMIN"); // 改为String类型
            admin.setEnabled(true); // 添加enabled字段
            userRepository.save(admin);
        }
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    @Transactional(readOnly = true)
    public Long countUsers() {
        return userRepository.count();
    }
    
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }
    
    @Transactional
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        
        // 1. 删除用户创建的评论和内容
        List<Comment> userComments = commentRepository.findByUserIdWithContent(id);
        if (!userComments.isEmpty()) {
            commentRepository.deleteAll(userComments);
        }
        
        List<Content> userContents = contentRepository.findByUserId(id);
        if (!userContents.isEmpty()) {
            contentRepository.deleteAll(userContents);
        }
        
        // 解除该用户锁定的内容
        List<Content> lockedContents = contentRepository.findByLockedByUserId(id);
        for (Content content : lockedContents) {
            content.setLockedByUser(null);
            content.setLockedAt(null);
            content.setLockedUntil(null);
            contentRepository.save(content);
        }
        
        // 删除用户的点赞记录
        List<Like> userLikes = likeRepository.findByUserId(id);
        if (!userLikes.isEmpty()) {
            likeRepository.deleteAll(userLikes);
        }
        
        // 9. 删除用户的内容编辑记录
        List<UserContentEdit> userContentEdits = userContentEditRepository.findByUserId(id);
        if (!userContentEdits.isEmpty()) {
            userContentEditRepository.deleteAll(userContentEdits);
        }
        
        // 处理Philosopher表中的外键约束 - 重置user_id为null
        List<Philosopher> userPhilosophers = philosopherRepository.findByUserId(id);
        for (Philosopher philosopher : userPhilosophers) {
            philosopher.setUser(null);
            philosopherRepository.save(philosopher);
        }
        
        // 12. 最后删除用户记录
        userRepository.delete(user);
    }
    
    @Transactional(readOnly = true)
    public boolean isAdmin(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null && "ADMIN".equals(user.getRole());
    }
    
    @Transactional(readOnly = true)
    public User getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String username = authentication.getName();
        try {
            return findByUsername(username);
        } catch (UsernameNotFoundException e) {
            return null;
        }
    }
    
    
    /**
     * 搜索用户（支持关键词）
     */
    @Transactional(readOnly = true)
    public List<User> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }
        String trimmed = query.trim();
        String normalized = SearchNormalizer.normalize(trimmed);
        if (normalized.isEmpty()) {
            return new ArrayList<>();
        }
        boolean strictAsciiToken = SearchNormalizer.isAsciiAlnumToken(trimmed);
        boolean enableSubsequence = !strictAsciiToken && SearchNormalizer.shouldEnableSubsequence(trimmed, normalized);
        String subsequencePattern = SearchNormalizer.buildSubsequenceLikePattern(normalized);
        List<User> list = userRepository.searchByUsernameOrNameNormalized(trimmed, normalized, subsequencePattern, enableSubsequence);
        if (strictAsciiToken) {
            list = list.stream().filter(u ->
                    SearchNormalizer.containsIgnoreCase(u.getUsername(), trimmed)
                            || SearchNormalizer.containsIgnoreCase(u.getFirstName(), trimmed)
                            || SearchNormalizer.containsIgnoreCase(u.getLastName(), trimmed))
                    .toList();
        }
        return list;
    }
    
}
    