package com.philosophy.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HistoryCenturyBucketTest {

    @Test
    void ce_1950_bucket_1900_to_1999() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(1950);
        assertEquals(1900, r.start());
        assertEquals(1999, r.end());
    }

    @Test
    void ce_1799_still_in_1700_bucket() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(1799);
        assertEquals(1700, r.start());
        assertEquals(1799, r.end());
    }

    @Test
    void ce_1800_enters_1800_bucket() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(1800);
        assertEquals(1800, r.start());
        assertEquals(1899, r.end());
    }

    @Test
    void ce_2000_stays_in_2000_bucket() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(2000);
        assertEquals(2000, r.start());
        assertEquals(2099, r.end());
    }

    @Test
    void ce_2001_stays_in_2000_bucket() {
        HistoryCenturyBucket.YearRange r = HistoryCenturyBucket.bucketContaining(2001);
        assertEquals(2000, r.start());
        assertEquals(2099, r.end());
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
        assertEquals(1, r.start());
        assertEquals(99, r.end());
    }

    @Test
    void sameBucket_symmetric() {
        assertTrue(HistoryCenturyBucket.sameBucket(1950, 1999));
        assertTrue(HistoryCenturyBucket.sameBucket(1700, 1799));
        assertTrue(HistoryCenturyBucket.sameBucket(-470, -401));
    }
}
