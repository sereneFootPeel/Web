package com.philosophy.util;

import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PinyinStringComparatorTest {

    private final PinyinStringComparator comparator = new PinyinStringComparator();

    @Test
    void compareUsesFullPinyinInsteadOfOnlyInitialLetters() {
        assertTrue(comparator.compare("陈安", "陈奥") < 0);
        assertTrue(comparator.compare("陈奥", "陈安") > 0);
    }

    @Test
    void sortIgnoresWhitespaceAndKeepsStablePinyinOrder() {
        List<String> names = new ArrayList<>(List.of(" 庄子", "孔子", " 老子 "));
        names.sort(comparator);

        assertEquals(List.of("孔子", " 老子 ", " 庄子"), names);
    }
}

