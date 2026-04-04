package com.philosophy.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HistoryCenturyBucketTest {

    @Test
    void ce_1950_bucket_1901_to_2000() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(1950);
        assertEquals(1901, r.start());
        assertEquals(2000, r.end());
    }

    @Test
    void ce_2000_still_in_1901_bucket() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(2000);
        assertEquals(1901, r.start());
    }

    @Test
    void ce_2001_next_bucket() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(2001);
        assertEquals(2001, r.start());
        assertEquals(2100, r.end());
    }

    @Test
    void bce_470_bucket_negative_five_hundreds() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(-470);
        assertEquals(-500, r.start());
        assertEquals(-401, r.end());
    }

    @Test
    void year_zero_treated_as_one() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(0);
        HistoryCenturyBucket.YearRange one = HistoryCenturyBucket.bucketContaining(1);
        assertEquals(one.start(), r.start());
        assertEquals(one.end(), r.end());
    }

    @Test
    void sameBucket_symmetric() {
        assertTrue(HistoryCenturyBucket.sameBucket(1950, 1999));
        assertTrue(HistoryCenturyBucket.sameBucket(-470, -401));
    }
}
