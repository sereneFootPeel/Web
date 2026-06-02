package com.philosophy.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CsvExportEmailServiceTest {

    @Mock
    private DataExportService dataExportService;
    @Mock
    private EmailService emailService;

    private CsvExportEmailService csvExportEmailService;

    @BeforeEach
    void setUp() {
        csvExportEmailService = new CsvExportEmailService(dataExportService, emailService);
    }

    @Test
    void sendCsvExportToEmailReusesSharedCsvAttachmentGeneration() {
        when(dataExportService.exportAllDataToCsv()).thenReturn("表头\n内容");

        CsvExportEmailService.CsvExportAttachment attachment = csvExportEmailService.createCsvAttachment();
        csvExportEmailService.sendCsvExportToEmail(
            "admin@example.com",
            "哲学网站数据导出",
            "<p>请查收附件</p>"
        );

        ArgumentCaptor<byte[]> bytesCaptor = ArgumentCaptor.forClass(byte[].class);
        ArgumentCaptor<String> filenameCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendReportWithAttachment(
            eq("admin@example.com"),
            argThat(subject -> subject != null && subject.startsWith("哲学网站数据导出 - ")),
            eq("<p>请查收附件</p>"),
            bytesCaptor.capture(),
            filenameCaptor.capture()
        );

        byte[] expectedBom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] sentBytes = bytesCaptor.getValue();
        assertArrayEquals(expectedBom, new byte[] {sentBytes[0], sentBytes[1], sentBytes[2]});
        assertEquals("表头\n内容", new String(sentBytes, 3, sentBytes.length - 3, StandardCharsets.UTF_8));
        assertArrayEquals(expectedBom, new byte[] {attachment.bytes()[0], attachment.bytes()[1], attachment.bytes()[2]});
        assertEquals("表头\n内容", new String(attachment.bytes(), 3, attachment.bytes().length - 3, StandardCharsets.UTF_8));
        assertTrue(filenameCaptor.getValue().startsWith("philosophy_data_export_"));
        assertTrue(filenameCaptor.getValue().endsWith(".csv"));
        assertTrue(attachment.filename().startsWith("philosophy_data_export_"));
        assertTrue(attachment.filename().endsWith(".csv"));
        assertTrue(attachment.timestamp().matches("\\d{14}"));
    }

    @Test
    void sendCsvExportToEmailRejectsBlankRecipient() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
            () -> csvExportEmailService.sendCsvExportToEmail("  ", "哲学网站数据导出", "<p>x</p>"));

        assertEquals("收件邮箱不能为空", exception.getMessage());
    }
}

