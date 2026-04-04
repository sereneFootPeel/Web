package com.philosophy.model;

/**
 * 历史页地图上的固定槽位；钉点经纬度由枚举定义，仅存 map_slot 于库表。
 */
public enum HistoryMapSlot {
    NA_NORTH("北美北部", "North America (North)", -95, 58),
    NA_SOUTH("北美南部", "North America (South)", -98, 28),
    ASIA_NORTH("亚洲北部", "Asia (North)", 105, 48),
    ASIA_SOUTH("亚洲南部", "Asia (South)", 110, 12),
    EUROPE("欧洲", "Europe", 15, 52),
    AFRICA("非洲", "Africa", 20, 2),
    OCEANIA("大洋洲", "Oceania", 135, -22),
    SA("南美", "South America", -58, -18);

    private final String labelZh;
    private final String labelEn;
    private final double markerLon;
    private final double markerLat;

    HistoryMapSlot(String labelZh, String labelEn, double markerLon, double markerLat) {
        this.labelZh = labelZh;
        this.labelEn = labelEn;
        this.markerLon = markerLon;
        this.markerLat = markerLat;
    }

    public String getLabelZh() {
        return labelZh;
    }

    public String getLabelEn() {
        return labelEn;
    }

    public double getMarkerLon() {
        return markerLon;
    }

    public double getMarkerLat() {
        return markerLat;
    }

    public static HistoryMapSlot fromCode(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim();
        if (t.isEmpty()) {
            return null;
        }
        try {
            return HistoryMapSlot.valueOf(t.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
