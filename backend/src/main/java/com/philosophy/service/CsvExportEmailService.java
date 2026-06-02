package com.philosophy.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class CsvExportEmailService {

    private static final byte[] UTF8_BOM = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
    private static final String DEFAULT_SUBJECT_PREFIX = "哲学网站数据导出";

    private final DataExportService dataExportService;
    private final EmailService emailService;

    public CsvExportEmailService(DataExportService dataExportService, EmailService emailService) {
        this.dataExportService = dataExportService;
        this.emailService = emailService;
    }

    public CsvExportAttachment createCsvAttachment() {
        String csvData = dataExportService.exportAllDataToCsv();
        byte[] csvBytes = csvData.getBytes(StandardCharsets.UTF_8);
        byte[] csvBytesWithBom = new byte[UTF8_BOM.length + csvBytes.length];
        System.arraycopy(UTF8_BOM, 0, csvBytesWithBom, 0, UTF8_BOM.length);
        System.arraycopy(csvBytes, 0, csvBytesWithBom, UTF8_BOM.length, csvBytes.length);

        String timestamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String filename = "philosophy_data_export_" + timestamp + ".csv";
        return new CsvExportAttachment(csvBytesWithBom, filename, timestamp);
    }

    public void sendCsvExportToEmail(String toEmail, String subjectPrefix, String htmlContent) {
        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException("收件邮箱不能为空");
        }

        CsvExportAttachment attachment = createCsvAttachment();
        String resolvedSubjectPrefix = (subjectPrefix == null || subjectPrefix.isBlank())
            ? DEFAULT_SUBJECT_PREFIX
            : subjectPrefix;

        emailService.sendReportWithAttachment(
            toEmail,
            resolvedSubjectPrefix + " - " + attachment.timestamp(),
            htmlContent,
            attachment.bytes(),
            attachment.filename()
        );
    }

    public record CsvExportAttachment(byte[] bytes, String filename, String timestamp) {
    }
}

