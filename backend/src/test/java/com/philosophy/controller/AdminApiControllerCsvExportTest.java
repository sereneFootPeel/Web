package com.philosophy.controller;

import com.philosophy.model.User;
import com.philosophy.service.ContentService;
import com.philosophy.service.CsvExportEmailService;
import com.philosophy.service.DataImportService;
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
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminApiControllerCsvExportTest {

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
    private CsvExportEmailService csvExportEmailService;
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
            csvExportEmailService,
            translationService
        );

        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setEmail("admin@example.com");
        auth = new TestingAuthenticationToken(adminUser, "pw", "ROLE_ADMIN");
    }

    @Test
    void sendCsvToEmailUsesSharedCsvEmailService() {
        ResponseEntity<Map<String, Object>> response = controller.sendCsvToEmail(auth);

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(true, body.get("success"));
        assertEquals("CSV 文件已发送至 admin@example.com", body.get("message"));
        verify(csvExportEmailService).sendCsvExportToEmail(
            eq("admin@example.com"),
            eq("哲学网站数据导出"),
            eq("<p>您好，</p><p>这是您请求的哲学网站数据导出 CSV 文件，请查收附件。</p>")
        );
    }

    @Test
    void downloadCsvUsesSharedCsvAttachmentBuilder() {
        byte[] csvBytes = new byte[] {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF, 'a', ',', 'b'};
        when(csvExportEmailService.createCsvAttachment())
            .thenReturn(new CsvExportEmailService.CsvExportAttachment(csvBytes, "philosophy_data_export_20260521080000.csv", "20260521080000"));

        ResponseEntity<byte[]> response = controller.downloadCsv(auth);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("attachment; filename=\"philosophy_data_export_20260521080000.csv\"",
            response.getHeaders().getFirst("Content-Disposition"));
        assertEquals("text/csv;charset=UTF-8", response.getHeaders().getContentType().toString());
        assertEquals("﻿a,b", new String(response.getBody(), StandardCharsets.UTF_8));
    }
}

