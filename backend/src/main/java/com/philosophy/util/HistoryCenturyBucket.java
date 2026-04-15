package com.philosophy.util;

/**
 * 历史页百年分段：公元后按 1900–1999 形式；公元前按整百对齐（如 -500 至 -401）。
 */
public final class HistoryCenturyBucket {

    private HistoryCenturyBucket() {
    }

    public record YearRange(int start, int end) {
    }

    /**
     * 包含 {@code year} 的百年区间（闭区间）。无公元 0 年时，若传入 0 则按 1 处理。
     */
    public static YearRange bucketContaining(int year) {
        if (year == 0) {
            year = 1;
        }
        if (year > 0) {
            if (year < 100) {
                return new YearRange(1, 99);
            }
            int start = Math.floorDiv(year, 100) * 100;
            return new YearRange(start, start + 99);
        }
        int q = Math.floorDiv(year, 100);
        int start = q * 100;
        return new YearRange(start, start + 99);
    }

    public static boolean sameBucket(int yearA, int yearB) {
        YearRange ra = bucketContaining(yearA);
        YearRange rb = bucketContaining(yearB);
        return ra.start() == rb.start() && ra.end() == rb.end();
    }
}
