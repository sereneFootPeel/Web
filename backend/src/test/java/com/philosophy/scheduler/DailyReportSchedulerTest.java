package com.philosophy.scheduler;

import com.philosophy.service.CsvExportEmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DailyReportSchedulerTest {

    @Mock
    private CsvExportEmailService csvExportEmailService;

    private DailyReportScheduler dailyReportScheduler;

    @BeforeEach
    void setUp() {
        dailyReportScheduler = new DailyReportScheduler(csvExportEmailService);
    }

    @Test
    void sendDailyCsvEmailUsesSharedAdminCsvEmailFlow() {
        ReflectionTestUtils.setField(dailyReportScheduler, "csvEmailEnabled", true);
        ReflectionTestUtils.setField(dailyReportScheduler, "recipientEmail", "daily@example.com");

        dailyReportScheduler.sendDailyCsvEmail();

        verify(csvExportEmailService).sendCsvExportToEmail(
            eq("daily@example.com"),
            eq("哲学网站每日数据导出"),
            contains("CSV 数据文件")
        );
    }

    @Test
    void sendDailyCsvEmailSkipsWhenDisabled() {
        ReflectionTestUtils.setField(dailyReportScheduler, "csvEmailEnabled", false);
        ReflectionTestUtils.setField(dailyReportScheduler, "recipientEmail", "daily@example.com");

        dailyReportScheduler.sendDailyCsvEmail();

        verify(csvExportEmailService, never()).sendCsvExportToEmail(eq("daily@example.com"), eq("哲学网站每日数据导出"), contains("CSV"));
    }

    @Test
    void sendDailyCsvEmailSkipsWhenRecipientBlank() {
        ReflectionTestUtils.setField(dailyReportScheduler, "csvEmailEnabled", true);
        ReflectionTestUtils.setField(dailyReportScheduler, "recipientEmail", "   ");

        dailyReportScheduler.sendDailyCsvEmail();

        verify(csvExportEmailService, never()).sendCsvExportToEmail(eq("   "), eq("哲学网站每日数据导出"), contains("CSV"));
    }
}

