package com.philosophy.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class DateUtilsHistoricalDateTest {

    @Test
    void parseHistoricalDate_supportsRangesDatesYearsMonthsAndBc() {
        assertEquals(19990000, DateUtils.parseHistoricalDate("1999 - 2000"));
        assertEquals(19990101, DateUtils.parseHistoricalDate("1999.1.1 - 2000.1.1"));
        assertEquals(19990101, DateUtils.parseHistoricalDate("1999 /1/1~2000/1/1"));
        assertEquals(19990100, DateUtils.parseHistoricalDate("1999/1"));
        assertEquals(19990100, DateUtils.parseHistoricalDate("1999/1~2000/1"));
        assertEquals(19990101, DateUtils.parseHistoricalDate("1999.1.1"));
        assertEquals(19990000, DateUtils.parseHistoricalDate("1999"));
        assertEquals(-1920000, DateUtils.parseHistoricalDate("192BC"));
        assertEquals(-5510000, DateUtils.parseHistoricalDate("-551"));
    }

    @Test
    void resolveHistoricalDateLabel_prefersNormalizedRawTextAndFallsBackToFormattedDate() {
        assertEquals("1999 - 2000", DateUtils.resolveHistoricalDateLabel(" 1999   -   2000 ", 19990000));
        assertEquals("1999/1/1 - 2000/1/1", DateUtils.resolveHistoricalDateLabel(" 1999 /1/1~2000/1/1 ", 19990101));
        assertEquals("1999.1", DateUtils.resolveHistoricalDateLabel(null, 19990100));
        assertEquals("1999.1.1", DateUtils.resolveHistoricalDateLabel(null, 19990101));
        assertEquals("", DateUtils.resolveHistoricalDateLabel(null, null));
        assertNull(DateUtils.normalizeHistoricalDateText("   "));
    }

    @Test
    void parseDeathYearFromRange_supportsYearMonthAndSlashSeparatedRanges() {
        assertEquals(20000101, DateUtils.parseDeathYearFromRange("1999 /1/1~2000/1/1"));
        assertEquals(20000100, DateUtils.parseDeathYearFromRange("1999/1~2000/1"));
        assertEquals(-4900000, DateUtils.parseDeathYearFromRange("460 - 490BC"));
    }
}

