package com.philosophy.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DataImportServiceForumCsvTest {

    @Test
    void clearTargetsIncludeForumTablesInDependencyOrder() {
        @SuppressWarnings("unchecked")
        List<String> tables = (List<String>) ReflectionTestUtils.getField(DataImportService.class, "CLEAR_ALL_TARGET_TABLES");
        assertTrue(tables.contains("forum_replies"));
        assertTrue(tables.contains("forum_threads"));
        assertTrue(tables.contains("forum_categories"));

        DataImportService service = new DataImportService();
        EntityManager entityManager = mock(EntityManager.class);
        List<String> statements = new ArrayList<>();
        when(entityManager.createNativeQuery(anyString())).thenAnswer(invocation -> {
            statements.add(invocation.getArgument(0, String.class));
            Query query = mock(Query.class);
            when(query.executeUpdate()).thenReturn(1);
            return query;
        });
        ReflectionTestUtils.setField(service, "entityManager", entityManager);

        ReflectionTestUtils.invokeMethod(
                service,
                "clearTablesInOrder",
                new LinkedHashSet<>(List.of("forum_replies", "forum_threads", "forum_categories")));

        assertEquals(List.of(
                "DELETE FROM forum_replies",
                "DELETE FROM forum_threads",
                "DELETE FROM forum_categories"
        ), statements);
    }

    @Test
    void importRestoresForumCategoriesThreadsAndReplies() {
        DataImportService service = new DataImportService();
        EntityManager entityManager = mock(EntityManager.class);
        Set<Long> replyIds = new HashSet<>();
        List<String> inserts = new ArrayList<>();
        List<Object> parentUpdates = new ArrayList<>();

        when(entityManager.createNativeQuery(anyString())).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0, String.class);
            Query query = mock(Query.class);
            AtomicReference<Object> firstParam = new AtomicReference<>();
            when(query.setParameter(anyInt(), any())).thenAnswer(setInvocation -> {
                if (Integer.valueOf(1).equals(setInvocation.getArgument(0, Integer.class))) {
                    firstParam.set(setInvocation.getArgument(1));
                }
                if (sql.startsWith("UPDATE forum_replies SET parent_id")) {
                    parentUpdates.add(setInvocation.getArgument(1));
                }
                return query;
            });
            if (sql.startsWith("SELECT id FROM forum_categories WHERE slug")) {
                when(query.getResultList()).thenReturn(List.of());
            } else if (sql.startsWith("SELECT id FROM forum_categories")
                    || sql.startsWith("SELECT id FROM users")
                    || sql.startsWith("SELECT id FROM forum_threads")) {
                when(query.getResultList()).thenAnswer(ignored -> List.of(firstParam.get()));
            } else if (sql.startsWith("SELECT id FROM forum_replies")) {
                when(query.getResultList()).thenAnswer(ignored -> {
                    Object id = firstParam.get();
                    if (id instanceof Number number && replyIds.contains(number.longValue())) {
                        return List.of(id);
                    }
                    return List.of();
                });
            } else if (sql.startsWith("UPDATE")) {
                when(query.executeUpdate()).thenReturn(0);
            } else if (sql.startsWith("INSERT")) {
                inserts.add(sql);
                when(query.executeUpdate()).thenAnswer(ignored -> {
                    if (sql.startsWith("INSERT INTO forum_replies") && firstParam.get() instanceof Number number) {
                        replyIds.add(number.longValue());
                    }
                    return 1;
                });
            }
            return query;
        });
        ReflectionTestUtils.setField(service, "entityManager", entityManager);

        DataImportService.ImportResult result = new DataImportService.ImportResult();
        ReflectionTestUtils.invokeMethod(service, "importForumCategories", result, List.<String[]>of(new String[] {
                "2", "general", "综合讨论", "General", "不限主题的哲学闲谈", "Open discussion", "1"
        }));
        ReflectionTestUtils.invokeMethod(service, "importForumThreads", result, List.<String[]>of(new String[] {
                "10", "2", "1", "From Senlac Hill", "A line", "1", "3", "0", "1",
                "2026-11-10T15:45:00", "2026-11-10T15:45:00", "2026-11-10T15:46:00"
        }));
        ReflectionTestUtils.invokeMethod(service, "importForumReplies", result, List.<String[]>of(
                new String[] {"9", "10", "8", "1", "A reply before its parent", "2026-11-10T15:47:00", "2026-11-10T15:47:00"},
                new String[] {"8", "10", "", "1", "William came ashore", "2026-11-10T15:46:00", "2026-11-10T15:46:00"}
        ));

        assertEquals(4, result.getTotalImported());
        assertEquals(0, result.getTotalFailed());
        assertTrue(inserts.stream().anyMatch(sql -> sql.startsWith("INSERT INTO forum_categories")));
        assertTrue(inserts.stream().anyMatch(sql -> sql.startsWith("INSERT INTO forum_threads")));
        assertEquals(2, inserts.stream().filter(sql -> sql.startsWith("INSERT INTO forum_replies")).count());
        assertEquals(List.of(8L, 9L), parentUpdates);
    }
}
