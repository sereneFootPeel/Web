package com.philosophy.scheduler;

import com.philosophy.service.CsvExportEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyReportScheduler {

    private static final Logger logger = LoggerFactory.getLogger(DailyReportScheduler.class);

    private final CsvExportEmailService csvExportEmailService;

    @Value("${app.csv-email.enabled:true}")
    private boolean csvEmailEnabled;

    @Value("${app.daily-report.email.recipient}")
    private String recipientEmail;

    public DailyReportScheduler(CsvExportEmailService csvExportEmailService) {
        this.csvExportEmailService = csvExportEmailService;
    }

    @Scheduled(cron = "${app.csv-email.cron:0 0 8 * * ?}")
    public void sendDailyCsvEmail() {
        if (!csvEmailEnabled) {
            return;
        }

        if (recipientEmail == null || recipientEmail.isBlank()) {
            logger.warn("跳过每日 CSV 邮件发送：未配置收件邮箱");
            return;
        }

        try {
            String content = "<html><body><h3>每日数据导出</h3><p>请查收附件中的 CSV 数据文件。</p></body></html>";

            csvExportEmailService.sendCsvExportToEmail(recipientEmail, "哲学网站每日数据导出", content);
        } catch (Exception e) {
            logger.error("每日 CSV 邮件发送失败", e);
        }
    }
}