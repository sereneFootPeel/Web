package com.philosophy.controller;

import com.philosophy.model.Philosopher;
import com.philosophy.model.User;
import com.philosophy.service.ContentService;
import com.philosophy.service.DataExportService;
import com.philosophy.service.DataImportService;
import com.philosophy.service.EmailService;
import com.philosophy.service.PhilosopherService;
import com.philosophy.service.SchoolService;
import com.philosophy.service.TranslationService;
import com.philosophy.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminApiControllerPhilosopherImageTest {

    @Mock
    private UserService userService;
    @Mock
    private PhilosopherService philosopherService;
    @Mock
    private SchoolService schoolService;
    @Mock
    private ContentService contentService;
    @Mock
    private DataImportService dataImportService;
    @Mock
    private DataExportService dataExportService;
    @Mock
    private EmailService emailService;
    @Mock
    private TranslationService translationService;

    private AdminApiController controller;
    private User adminUser;
    private TestingAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        controller = new AdminApiController(
            userService,
            philosopherService,
            schoolService,
            contentService,
            dataImportService,
            dataExportService,
            emailService,
            translationService
        );

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        auth = new TestingAuthenticationToken(adminUser, "pw", "ROLE_ADMIN");

        when(philosopherService.hasStoredImage(any(Philosopher.class))).thenAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            return philosopher != null && philosopher.hasImage();
        });
    }

    @Test
    void createPhilosopherMultipartStoresImageInDatabaseAndReturnsApiImageUrl() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "imageFile",
            "confucius.png",
            "image/png",
            new byte[] {1, 2, 3, 4}
        );

        doAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            MockMultipartFile multipartFile = invocation.getArgument(1);
            philosopher.setImageData(multipartFile.getBytes());
            philosopher.setImageContentType(multipartFile.getContentType());
            philosopher.setImageFileName(multipartFile.getOriginalFilename());
            return null;
        }).when(philosopherService).storeImage(any(Philosopher.class), any());

        when(philosopherService.savePhilosopherForAdmin(any(Philosopher.class), eq(adminUser))).thenAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            philosopher.setId(42L);
            philosopher.setUpdatedAt(LocalDateTime.of(2026, 5, 10, 16, 20, 0));
            return philosopher;
        });

        ResponseEntity<Map<String, Object>> response = controller.createPhilosopherMultipart(
            auth,
            Map.of("name", "孔子", "bio", "儒家代表人物"),
            file
        );

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));

        @SuppressWarnings("unchecked")
        Map<String, Object> philosopher = (Map<String, Object>) body.get("philosopher");
        assertNotNull(philosopher);
        assertEquals("/api/philosophers/42/image", philosopher.get("imageUrl"));
        assertEquals("2026-05-10T16:20", philosopher.get("imageVersion"));
        assertEquals(true, philosopher.get("hasImage"));
    }

    @Test
    void updatePhilosopherMultipartCanClearExistingImage() {
        Philosopher existing = new Philosopher();
        existing.setId(7L);
        existing.setName("苏格拉底");
        existing.setImageData(new byte[] {9, 9, 9});
        existing.setImageContentType("image/jpeg");
        existing.setImageFileName("socrates.jpg");

        when(philosopherService.getPhilosopherById(7L)).thenReturn(existing);
        when(philosopherService.savePhilosopherForAdmin(any(Philosopher.class), eq(adminUser))).thenAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            philosopher.setUpdatedAt(LocalDateTime.of(2026, 5, 10, 16, 21, 0));
            return philosopher;
        });
        doAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            philosopher.clearImage();
            return null;
        }).when(philosopherService).clearImage(any(Philosopher.class));

        ResponseEntity<Map<String, Object>> response = controller.updatePhilosopherMultipart(
            auth,
            7L,
            Map.of("clearImage", "true"),
            null
        );

        assertEquals(200, response.getStatusCode().value());
        assertFalse(existing.hasImage());

        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        @SuppressWarnings("unchecked")
        Map<String, Object> philosopher = (Map<String, Object>) body.get("philosopher");
        assertNotNull(philosopher);
        assertNull(philosopher.get("imageUrl"));
        assertNull(philosopher.get("imageVersion"));
        assertEquals(false, philosopher.get("hasImage"));
    }

    @Test
    void updatePhilosopherMultipartReplacesExistingImageWhenNewFileIsUploaded() throws IOException {
        Philosopher existing = new Philosopher();
        existing.setId(9L);
        existing.setName("孟子");
        existing.setImageData(new byte[] {1, 1, 1});
        existing.setImageContentType("image/jpeg");
        existing.setImageFileName("mencius-old.jpg");

        MockMultipartFile file = new MockMultipartFile(
            "imageFile",
            "mencius-new.png",
            "image/png",
            new byte[] {7, 8, 9}
        );

        when(philosopherService.getPhilosopherById(9L)).thenReturn(existing);
        doAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            MockMultipartFile multipartFile = invocation.getArgument(1);
            philosopher.setImageData(multipartFile.getBytes());
            philosopher.setImageContentType(multipartFile.getContentType());
            philosopher.setImageFileName(multipartFile.getOriginalFilename());
            return null;
        }).when(philosopherService).storeImage(any(Philosopher.class), any());
        when(philosopherService.savePhilosopherForAdmin(any(Philosopher.class), eq(adminUser))).thenAnswer(invocation -> {
            Philosopher philosopher = invocation.getArgument(0);
            philosopher.setUpdatedAt(LocalDateTime.of(2026, 5, 10, 16, 22, 0));
            return philosopher;
        });

        ResponseEntity<Map<String, Object>> response = controller.updatePhilosopherMultipart(
            auth,
            9L,
            Map.of("clearImage", "true"),
            file
        );

        assertEquals(200, response.getStatusCode().value());
        assertTrue(existing.hasImage());
        assertEquals("image/png", existing.getImageContentType());
        assertEquals("mencius-new.png", existing.getImageFileName());
        assertTrue(Arrays.equals(new byte[] {7, 8, 9}, existing.getImageData()));

        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        @SuppressWarnings("unchecked")
        Map<String, Object> philosopher = (Map<String, Object>) body.get("philosopher");
        assertNotNull(philosopher);
        assertEquals("/api/philosophers/9/image", philosopher.get("imageUrl"));
        assertEquals("2026-05-10T16:22", philosopher.get("imageVersion"));
        assertEquals(true, philosopher.get("hasImage"));
    }
}

