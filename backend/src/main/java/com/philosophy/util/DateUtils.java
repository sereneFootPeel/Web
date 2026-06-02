package com.philosophy.util;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * 日期工具类，用于处理哲学家出生死亡日期的格式转换
 */
public class DateUtils {

    private static final Pattern SIGNED_INTEGER_PATTERN = Pattern.compile("^[+-]?\\d+$");

    /**
     * 日期分隔符兼容：支持 "."、"．"、"/"、"／"
     */
    private static final String DATE_SEP = "[\\.．/／]";

    /**
     * 范围分隔符兼容：支持 "-"、"–"、"—"、"－"、"~"、"～"
     */
    private static final String RANGE_SEP = "[-–—－~～]";

    private static final Pattern YEAR_MONTH_DAY_PATTERN = Pattern.compile(
        "^(c\\.)?\\s*([+-]?\\d+)(?:\\s*(bc))?" + DATE_SEP + "(\\d{1,2})" + DATE_SEP + "(\\d{1,2})$",
        Pattern.CASE_INSENSITIVE
    );
    private static final Pattern YEAR_MONTH_PATTERN = Pattern.compile(
        "^(c\\.)?\\s*([+-]?\\d+)(?:\\s*(bc))?" + DATE_SEP + "(\\d{1,2})$",
        Pattern.CASE_INSENSITIVE
    );
    private static final Pattern YEAR_ONLY_PATTERN = Pattern.compile(
        "^(c\\.)?\\s*([+-]?\\d+)\\s*(bc)?$",
        Pattern.CASE_INSENSITIVE
    );
    private static final Pattern RANGE_PATTERN = Pattern.compile("\\s+-\\s+");

    private static Integer encodeHistoricalDate(int year, int month, int day) {
        int absolute = Math.abs(year) * 10000 + month * 100 + day;
        return year < 0 ? -absolute : absolute;
    }

    private static Integer parseHistoricalYear(String yearText, String bcMarker) {
        int year = Integer.parseInt(yearText);
        if (bcMarker != null && !bcMarker.isEmpty()) {
            return -Math.abs(year);
        }
        return year;
    }

    private static Integer parseHistoricalDatePoint(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        Matcher matcher = YEAR_MONTH_DAY_PATTERN.matcher(text);
        if (matcher.matches()) {
            try {
                int year = parseHistoricalYear(matcher.group(2), matcher.group(3));
                int month = Integer.parseInt(matcher.group(4));
                int day = Integer.parseInt(matcher.group(5));
                if (month < 1 || month > 12 || day < 1 || day > 31) {
                    return null;
                }
                return encodeHistoricalDate(year, month, day);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        matcher = YEAR_MONTH_PATTERN.matcher(text);
        if (matcher.matches()) {
            try {
                int year = parseHistoricalYear(matcher.group(2), matcher.group(3));
                int month = Integer.parseInt(matcher.group(4));
                if (month < 1 || month > 12) {
                    return null;
                }
                return encodeHistoricalDate(year, month, 0);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        matcher = YEAR_ONLY_PATTERN.matcher(text);
        if (matcher.matches()) {
            try {
                boolean hasApproxMarker = matcher.group(1) != null;
                int year = parseHistoricalYear(matcher.group(2), matcher.group(3));
                return encodeHistoricalDate(year, 0, hasApproxMarker ? 1 : 0);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }

        return null;
    }
    
    /**
     * 将日期范围字符串解析为出生日期的整数格式（YYYYMMDD）
     * 如果解析失败，返回 null
     * 支持多种格式：
     * 1. "1914.11.18 - 1975.3.4" (完整日期范围，会解析为19141118)
     * 2. "1914.11.18" (仅出生日期，会解析为19141118)
     * 3. "c.460 - 490BC" (年份范围，公元前，会解析为-4600101)
     * 4. "c.460BC" (单个年份，公元前，会解析为-4600101)
     * 5. "460 - 490BC" (年份范围，公元前，会解析为-4600101)
     * 6. "460BC" (单个年份，公元前，会解析为-4600101)
     * 7. "460" (单个年份，公元，会解析为4600101)
     * 
     * 生成的YYYYMMDD格式数字用于数据库存储和排序，例如：
     * - "1914.11.18" -> 19141118
     * - "1975.3.4" -> 19750304
     * - "460BC" -> -4600000（仅年份，月日补 00 用于排序）
     * - "c.460BC" -> -4600001（约年，仅年份，day=01 标记 circa）
     * 
     * @param dateRange 日期范围字符串，支持多种格式
     * @return 出生日期的整数格式（YYYYMMDD），如果解析失败返回 null
     */
    public static Integer parseBirthDateFromRange(String dateRange) {
        String cleaned = normalizeHistoricalDateText(dateRange);
        if (cleaned == null) {
            return null;
        }

        String[] parts = RANGE_PATTERN.split(cleaned, 2);
        return parseHistoricalDatePoint(parts[0]);
    }
    
    /**
     * 将 birthYear（YYYYMMDD 格式）和 deathYear 转换为日期范围字符串
     * 支持多种格式：
     * - 完整日期：YYYY.M.D - YYYY.M.D
     * - 年份格式（公元前）：c. 460 - 490 BC（当月份和日期都是1时，或者月份为1日期为2表示"c."）
     * - 年份格式（公元）：460 - 490（当月份和日期都是1时）
     * 
     * @param birthYear 出生日期（YYYYMMDD 格式的整数，可为负数表示公元前）
     * @param deathYear 死亡年份（整数，可选，可为负数表示公元前）
     * @return 日期范围字符串，如果 birthYear 为 null 返回空字符串
     */
    public static String formatBirthYearToDateRange(Integer birthYear, Integer deathYear) {
        if (birthYear == null) {
            return "";
        }
        
        // 解析 YYYYMMDD 格式，支持负数年份（公元前）
        boolean isNegative = birthYear < 0;
        int absBirthYear = Math.abs(birthYear);
        int year = absBirthYear / 10000;
        int month = (absBirthYear % 10000) / 100;
        int day = absBirthYear % 100;
        
        // 如果是负数年份，添加负号
        if (isNegative) {
            year = -year;
        }
        
        boolean isYearMonthFormat = !isNegative && month > 0 && day == 0;

        // 判断是否为年份格式
        // - 用户输入了月份和日期：month/day 为真实值（>=1），显示完整日期（包括 1.1）
        // - 用户只输入年份：存储为 YYYY0000（月日补 00 用于排序），显示年份
        // - 约年（c.）：存储为 YYYY0001（day=01 标记 circa），显示 "c. YYYY"
        // - 公元前年份：强制使用年份格式显示，避免显示如 -490.0.0 这样的格式
        boolean isYearOnlyFormat = isNegative || (month == 0 && (day == 0 || day == 1));
        boolean hasApproxMarker = (month == 0 && day == 1);
        
        // 预先检查死亡年份是否为BC，以决定是否在出生年份显示BC
        boolean isDeathBC = false;
        if (deathYear != null && Math.abs(deathYear) >= 10000) {
            isDeathBC = deathYear < 0;
        } else if (deathYear != null) {
            isDeathBC = deathYear < 0;
        }
        
        // 如果出生和死亡都是BC，则出生年份不显示BC，只在最后显示
        boolean showBirthBC = isNegative && (!isDeathBC || deathYear == null);
        
        // 构建出生日期部分
        String birthDateStr;
        if (isYearOnlyFormat) {
            // 年份格式：显示时不补齐 0（补齐 0 仅用于排序存储）
            StringBuilder sb = new StringBuilder();
            if (hasApproxMarker) {
                sb.append("c. ");
            }
            sb.append(Math.abs(year));
            if (showBirthBC) {
                sb.append(" BC");
            }
            birthDateStr = sb.toString();
        } else if (isYearMonthFormat) {
            birthDateStr = String.format("%d.%d", year, month);
        } else {
            // 完整日期格式：只要写了月份和日期就显示完整日期（包括 1.1）
            birthDateStr = String.format("%d.%d.%d", year, month, day);
        }
        
        // 如果有死亡年份，构建死亡日期部分
        if (deathYear != null) {
            // 如果 deathYear 是 YYYYMMDD 格式（绝对值 >= 10000），解析它
            if (Math.abs(deathYear) >= 10000) {
                boolean isNegativeDeath = deathYear < 0;
                int absDeathYear = Math.abs(deathYear);
                int deathYearInt = absDeathYear / 10000;
                int deathMonth = (absDeathYear % 10000) / 100;
                int deathDay = absDeathYear % 100;
                
                // 如果是负数年份，添加负号
                if (isNegativeDeath) {
                    deathYearInt = -deathYearInt;
                }
                
                boolean isDeathYearMonthFormat = !isNegativeDeath && deathMonth > 0 && deathDay == 0;

                // 判断死亡日期是否为年份格式（使用与出生日期相同的逻辑）
                boolean isDeathYearOnlyFormat = isNegativeDeath || (deathMonth == 0 && (deathDay == 0 || deathDay == 1));
                boolean deathHasApproxMarker = (deathMonth == 0 && deathDay == 1);
                
                String deathDateStr;
                if (isDeathYearOnlyFormat) {
                    // 年份格式：显示时不补齐 0（补齐 0 仅用于排序存储）
                    StringBuilder sb = new StringBuilder();
                    if (deathHasApproxMarker) {
                        sb.append("c. ");
                    }
                    sb.append(Math.abs(deathYearInt));
                    if (isNegativeDeath) {
                        sb.append(" BC");
                    }
                    deathDateStr = sb.toString();
                } else if (isDeathYearMonthFormat) {
                    deathDateStr = String.format("%d.%d", deathYearInt, deathMonth);
                } else {
                    // 完整日期格式：只要写了月份和日期就显示完整日期（包括 1.1）
                    deathDateStr = String.format("%d.%d.%d", deathYearInt, deathMonth, deathDay);
                }
                
                return birthDateStr + " - " + deathDateStr;
            } else {
                // 如果只是年份（绝对值 < 10000），使用年份格式（旧数据兼容）
                String deathDateStr;
                if (deathYear < 0) {
                    deathDateStr = Math.abs(deathYear) + " BC";
                } else {
                    deathDateStr = String.valueOf(deathYear);
                }
                return birthDateStr + " - " + deathDateStr;
            }
        }
        
        // 如果没有死亡日期，只返回出生日期
        return birthDateStr;
    }
    
    /**
     * 从日期范围字符串中提取死亡日期
     * 支持多种格式：
     * 1. "1914.11.18 - 1975.3.4" (完整日期范围，会解析为19750304)
     * 2. "c. 460 - 490 BC" (年份范围，公元前，会解析为-4900101)
     * 3. "460 - 490 BC" (年份范围，公元前，会解析为-4900101)
     * 
     * @param dateRange 日期范围字符串，支持多种格式
     * @return 死亡日期的整数格式（YYYYMMDD），如果解析失败或没有死亡日期返回 null
     */
    public static Integer parseDeathYearFromRange(String dateRange) {
        String cleaned = normalizeHistoricalDateText(dateRange);
        if (cleaned == null) {
            return null;
        }

        String[] parts = RANGE_PATTERN.split(cleaned, 2);
        if (parts.length < 2) {
            return null;
        }
        Integer deathDate = parseHistoricalDatePoint(parts[1]);
        if (deathDate != null) {
            return deathDate;
        }

        Integer startDate = parseHistoricalDatePoint(parts[0]);
        Integer endYearOnlyDate = parseHistoricalDatePoint(parts[1] + "BC");
        if (startDate != null && startDate < 0 && endYearOnlyDate != null) {
            return endYearOnlyDate;
        }
        return null;
    }
    
    /**
     * 将旧格式的年份（如1999或-551）转换为YYYYMMDD格式（如19990101或-5510101）
     * 用于统一数据格式，确保所有日期都是YYYYMMDD格式，便于排序
     * 
     * @param year 年份（可能是旧格式，如1999或-551）
     * @return 转换后的YYYYMMDD格式（如19990101或-5510101），如果输入为null返回null
     */
    public static Integer convertYearToDateFormat(Integer year) {
        if (year == null) {
            return null;
        }

        if (Math.abs(year) >= 10000) {
            return year;
        }

        return year * 10000;
    }

    public static String normalizeHistoricalDateText(String rawText) {
        if (rawText == null) {
            return null;
        }
        String normalized = rawText.trim().replaceAll("\\s+", " ");
        normalized = normalized.replaceAll("\\s*([\\.．/／])\\s*", "$1");
        normalized = normalized.replaceAll("\\s*[~～]\\s*", " - ");
        normalized = normalized.replaceAll("(?<=\\S)\\s*[-–—－]\\s*(?=\\S)", " - ");
        normalized = normalized.replaceAll("\\s+", " ").trim();
        return normalized.isEmpty() ? null : normalized;
    }

    public static Integer parseHistoricalDate(String dateStr) {
        String normalized = normalizeHistoricalDateText(dateStr);
        if (normalized == null) {
            return null;
        }
        if (SIGNED_INTEGER_PATTERN.matcher(normalized).matches()) {
            try {
                return convertYearToDateFormat(Integer.parseInt(normalized));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return parseBirthDateFromRange(normalized);
    }

    public static String resolveHistoricalDateLabel(String rawText, Integer yyyymmdd) {
        String normalized = normalizeHistoricalDateText(rawText);
        if (normalized != null) {
            return normalized;
        }
        return formatHistoricalDate(yyyymmdd);
    }

    public static String formatHistoricalDate(Integer yyyymmdd) {
        if (yyyymmdd == null) return "";
        if (Math.abs(yyyymmdd) < 10000) {
            return yyyymmdd < 0 ? Math.abs(yyyymmdd) + " BC" : String.valueOf(yyyymmdd);
        }
        return formatBirthYearToDateRange(yyyymmdd, null);
    }

    public static String formatHistoricalDate(int yyyymmdd) {
        if (Math.abs(yyyymmdd) < 10000) {
            return yyyymmdd < 0 ? Math.abs(yyyymmdd) + " BC" : String.valueOf(yyyymmdd);
        }
        return formatBirthYearToDateRange(yyyymmdd, null);
    }

    public static Integer extractTimelineYear(Integer yyyymmdd) {
        if (yyyymmdd == null) return null;
        if (Math.abs(yyyymmdd) < 10000) return yyyymmdd;
        int abs = Math.abs(yyyymmdd);
        int year = abs / 10000;
        return yyyymmdd < 0 ? -year : year;
    }

    public static Integer extractTimelineYear(int yyyymmdd) {
        if (Math.abs(yyyymmdd) < 10000) return yyyymmdd;
        int abs = Math.abs(yyyymmdd);
        int year = abs / 10000;
        return yyyymmdd < 0 ? -year : year;
    }
}
