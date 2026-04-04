package com.philosophy.service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DataImportServiceHistorySupportTest {
    @Test
    void importCsvData_withoutHistorySections_skipsHistoryImportWithoutFailing() {
        RecordingDataImportService service = new RecordingDataImportService();
        String csv = """
            用户数据
            ID,用户名
            1,test-user
            """;
        DataImportService.ImportResult result = service.importCsvData(new MockMultipartFile(
            "file",
            "no-history.csv",
            "text/csv",
            csv.getBytes(StandardCharsets.UTF_8)
        ));
        assertTrue(result.isSuccess());
        assertEquals(1, result.getTotalImported());
        assertNull(service.importedHistoryCountryData);
        assertNull(service.importedHistoryEventData);
    }
    @Test
    void importCsvData_withHistorySections_routesRowsToHistoryImporters() {
        RecordingDataImportService service = new RecordingDataImportService();
        String csv = """
            用户数据
            ID,用户名
            1,test-user
            历史国家数据
            ID,国家代码,中文名称,英文名称,地图槽位,标记经度,标记纬度,创建时间,更新时间
            1,US,美国,United States,NA_NORTH,-95.7129,37.0902,2026-04-03T00:00:00,2026-04-03T00:00:00
            历史事件数据
            ID,国家ID,开始年份,中文摘要,英文摘要
            10,1,1776,独立宣言,Declaration of Independence
            """;
        DataImportService.ImportResult result = service.importCsvData(new MockMultipartFile(
            "file",
            "with-history.csv",
            "text/csv",
            csv.getBytes(StandardCharsets.UTF_8)
        ));
        assertTrue(result.isSuccess());
        assertNotNull(service.importedHistoryCountryData);
        assertNotNull(service.importedHistoryEventData);
        assertEquals(1, service.importedHistoryCountryData.size());
        assertEquals(1, service.importedHistoryEventData.size());
        assertEquals("US", service.importedHistoryCountryData.get(0)[1]);
        assertEquals("1776", service.importedHistoryEventData.get(0)[2]);
    }
    @Test
    void clearTablesInOrder_includesNewHistoryTables() {
        DataImportService service = new DataImportService();
        EntityManager entityManager = mock(EntityManager.class);
        Set<String> sqlStatements = new LinkedHashSet<>();
        when(entityManager.createNativeQuery(anyString())).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0, String.class);
            sqlStatements.add(sql);
            Query query = mock(Query.class);
            if (sql.contains("information_schema.tables")) {
                when(query.getSingleResult()).thenReturn(1L);
            } else if (sql.startsWith("SELECT COUNT(*)")) {
                when(query.getSingleResult()).thenReturn(0L);
            } else {
                when(query.executeUpdate()).thenReturn(1);
            }
            return query;
        });
        ReflectionTestUtils.setField(service, "entityManager", entityManager);
        ReflectionTestUtils.invokeMethod(service, "clearTablesInOrder", Set.of(
            "history_philosophy_bucket_cache",
            "history_event",
            "history_country",
            "user_login_info",
            "user_blocks",
            "user_content_edits",
            "likes",
            "user_follows",
            "comments",
            "contents_translation",
            "philosophers_translation",
            "schools_translation",
            "philosopher_school",
            "contents",
            "philosophers",
            "schools",
            "users"
        ));
        assertTrue(sqlStatements.contains("DELETE FROM history_philosophy_bucket_cache"));
        assertTrue(sqlStatements.contains("DELETE FROM history_event"));
        assertTrue(sqlStatements.contains("DELETE FROM history_country"));
    }

    @Test
    void clearAllDataSafely_runsDeleteTransactionThenVerifiesRemainingCounts() {
        DataImportService service = new DataImportService();
        EntityManager entityManager = mock(EntityManager.class);
        TransactionTemplate transactionTemplate = mock(TransactionTemplate.class);
        TransactionStatus transactionStatus = mock(TransactionStatus.class);
        Set<String> sqlStatements = new LinkedHashSet<>();

        when(transactionTemplate.execute(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            TransactionCallback<Object> callback = invocation.getArgument(0, TransactionCallback.class);
            return callback.doInTransaction(transactionStatus);
        });

        when(entityManager.createNativeQuery(anyString())).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0, String.class);
            sqlStatements.add(sql);
            Query query = mock(Query.class);
            when(query.setParameter(anyInt(), any())).thenReturn(query);
            if (sql.contains("information_schema.tables")) {
                when(query.getSingleResult()).thenReturn(1L);
            } else if (sql.startsWith("SELECT COUNT(*)")) {
                when(query.getSingleResult()).thenReturn(0L);
            } else {
                when(query.executeUpdate()).thenReturn(1);
            }
            return query;
        });

        ReflectionTestUtils.setField(service, "entityManager", entityManager);
        ReflectionTestUtils.setField(service, "transactionTemplate", transactionTemplate);

        service.clearAllDataSafely();

        assertTrue(sqlStatements.contains("SET FOREIGN_KEY_CHECKS = 0"));
        assertTrue(sqlStatements.contains("SET FOREIGN_KEY_CHECKS = 1"));
        assertTrue(sqlStatements.contains("DELETE FROM history_philosophy_bucket_cache"));
        assertTrue(sqlStatements.contains("DELETE FROM history_event"));
        assertTrue(sqlStatements.contains("DELETE FROM history_country"));
        assertTrue(sqlStatements.contains("SELECT COUNT(*) FROM history_philosophy_bucket_cache"));
        assertTrue(sqlStatements.contains("SELECT COUNT(*) FROM history_event"));
        assertTrue(sqlStatements.contains("SELECT COUNT(*) FROM history_country"));
    }

    private static class RecordingDataImportService extends DataImportService {
        private List<String[]> importedHistoryCountryData;
        private List<String[]> importedHistoryEventData;
        @Override
        public void importUsersInTransaction(ImportResult result, List<String[]> data) {
            if (data != null && !data.isEmpty()) {
                result.addResult("用户", data.size(), 0);
            } else {
                result.addResult("用户", 0, 0);
            }
        }
        @Override
        public void importSchoolsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importPhilosophersInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importPhilosopherSchoolAssociationsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importContentsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void updateContentAssociationsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importCommentsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importLikesInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importUserContentEditsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importUserBlocksInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importUserFollowsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importSchoolTranslationsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importContentTranslationsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importPhilosopherTranslationsInTransaction(ImportResult result, List<String[]> data) {
        }
        @Override
        public void importHistoryCountriesInTransaction(ImportResult result, List<String[]> data) {
            importedHistoryCountryData = data;
            result.addResult("历史国家", data == null ? 0 : data.size(), 0);
        }
        @Override
        public void importHistoryEventsInTransaction(ImportResult result, List<String[]> data) {
            importedHistoryEventData = data;
            result.addResult("历史事件", data == null ? 0 : data.size(), 0);
        }
    }
}
