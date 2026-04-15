package com.philosophy.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class DateUtilsHistoricalDateTest {

    @Test
    void parseHistoricalDate_supportsRangesDatesYearsAndBc() {
        assertEquals(19990000, DateUtils.parseHistoricalDate("1999 - 2000"));
        assertEquals(19990101, DateUtils.parseHistoricalDate("1999.1.1 - 2000.1.1"));
        assertEquals(19990101, DateUtils.parseHistoricalDate("1999.1.1"));
        assertEquals(19990000, DateUtils.parseHistoricalDate("1999"));
        assertEquals(-1920000, DateUtils.parseHistoricalDate("192BC"));
        assertEquals(-5510000, DateUtils.parseHistoricalDate("-551"));
    }

    @Test
    void resolveHistoricalDateLabel_prefersRawTextAndFallsBackToFormattedDate() {
        assertEquals("1999 - 2000", DateUtils.resolveHistoricalDateLabel(" 1999   -   2000 ", 19990000));
        assertEquals("1999.1.1", DateUtils.resolveHistoricalDateLabel(null, 19990101));
        assertEquals("", DateUtils.resolveHistoricalDateLabel(null, null));
        assertNull(DateUtils.normalizeHistoricalDateText("   "));
    }
}

