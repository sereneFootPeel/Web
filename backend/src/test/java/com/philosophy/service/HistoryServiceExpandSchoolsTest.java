package com.philosophy.service;

import com.philosophy.model.School;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HistoryServiceExpandSchoolsTest {

    private final HistoryService service = new HistoryService(null, null, null, null);

    @Test
    void expand_withoutDescendants_onlyRoot() {
        School root = new School();
        root.setId(10L);
        School child = new School();
        child.setId(11L);
        child.setParent(root);
        Set<Long> out = new HashSet<>();
        service.expandSchoolIds(10L, false, List.of(root, child), out);
        assertEquals(Set.of(10L), out);
    }

    @Test
    void expand_withDescendants_includesSubtree() {
        School root = new School();
        root.setId(1L);
        School a = new School();
        a.setId(2L);
        a.setParent(root);
        School b = new School();
        b.setId(3L);
        b.setParent(a);
        Set<Long> out = new HashSet<>();
        service.expandSchoolIds(1L, true, List.of(root, a, b), out);
        assertEquals(Set.of(1L, 2L, 3L), out);
    }
}
