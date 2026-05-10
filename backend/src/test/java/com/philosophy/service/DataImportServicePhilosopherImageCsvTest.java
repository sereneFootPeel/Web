package com.philosophy.service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
class DataImportServicePhilosopherImageCsvTest {
    @Test
    void importPhilosophersWritesImageBlobColumnsFromInlineCsvFields() {
        DataImportService service = new DataImportService();
        EntityManager entityManager = mock(EntityManager.class);
        AtomicReference<String> updateSql = new AtomicReference<>();
        Map<Integer, Object> updateParams = new HashMap<>();
        when(entityManager.createNativeQuery(anyString())).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0, String.class);
            Query query = mock(Query.class);
            when(query.setParameter(anyInt(), any())).thenAnswer(setInvocation -> {
                Integer index = setInvocation.getArgument(0, Integer.class);
                Object value = setInvocation.getArgument(1);
                if (sql.startsWith("UPDATE philosophers")) {
                    updateParams.put(index, value);
                }
                return query;
            });
            if (sql.contains("information_schema.columns")) {
                when(query.getSingleResult()).thenReturn(1L);
            } else if (sql.startsWith("SELECT id FROM users")) {
                when(query.getResultList()).thenReturn(List.of(99L));
            } else if (sql.startsWith("UPDATE philosophers")) {
                updateSql.set(sql);
                when(query.executeUpdate()).thenReturn(1);
            }
            return query;
        });
        ReflectionTestUtils.setField(service, "entityManager", entityManager);
        DataImportService.ImportResult result = new DataImportService.ImportResult();
        String imageBase64 = Base64.getEncoder().encodeToString(new byte[] {11, 12, 13});
        List<String[]> rows = Collections.singletonList(new String[] {
            "5",
            "柏拉图",
            "Plato",
            "-427",
            "-347",
            "古希腊",
            "理念论代表人物",
            "Theory of forms",
            "image/png",
            "plato.png",
            imageBase64,
            "99",
            "7",
            "2026-05-10T10:00:00",
            "2026-05-10T10:30:00"
        });
        ReflectionTestUtils.invokeMethod(service, "importPhilosophers", result, rows);
        assertEquals(1, result.getTotalImported());
        assertNotNull(updateSql.get());
        assertTrue(updateSql.get().contains("image_data = ?"));
        assertTrue(updateSql.get().contains("image_content_type = ?"));
        assertTrue(updateSql.get().contains("image_file_name = ?"));
        assertTrue(updateSql.get().contains("image_url = NULL"));
        assertTrue(updateParams.containsValue("image/png"));
        assertTrue(updateParams.containsValue("plato.png"));
        byte[] importedImageBytes = updateParams.values().stream()
            .filter(byte[].class::isInstance)
            .map(byte[].class::cast)
            .findFirst()
            .orElseThrow();
        assertArrayEquals(new byte[] {11, 12, 13}, importedImageBytes);
    }
}