package com.philosophy.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * 将测试结果 JSON 解析为结构化分数行，供 API 与详情预览共用。
 */
public final class TestResultScoreFormatter {

    private TestResultScoreFormatter() {
    }

    public static List<Map<String, Object>> parseScoreRows(String testType, String resultJson, ObjectMapper objectMapper) {
        List<Map<String, Object>> rows = new ArrayList<>();
        if (resultJson == null || resultJson.isBlank()) {
            return rows;
        }
        try {
            JsonNode root = objectMapper.readTree(resultJson);
            String type = testType == null ? "" : testType;

            if ("enneagram".equals(type) && root.has("scores") && root.get("scores").isObject()) {
                JsonNode scores = root.get("scores");
                JsonNode typeNames = root.has("typeNames") ? root.get("typeNames") : null;
                int max = 0;
                for (int t = 1; t <= 9; t++) {
                    String key = String.valueOf(t);
                    int score = scores.has(key) ? scores.get(key).asInt(0) : 0;
                    if (score > max) max = score;
                }
                if (max <= 0) max = 1;
                for (int t = 1; t <= 9; t++) {
                    String key = String.valueOf(t);
                    String name = (typeNames != null && typeNames.has(key)) ? typeNames.get(key).asText("") : "";
                    int score = scores.has(key) ? scores.get(key).asInt(0) : 0;
                    String label = name.isEmpty() ? ("型" + t) : ("型" + t + " " + name);
                    Map<String, Object> m = new HashMap<>();
                    m.put("rowType", "enneagram");
                    m.put("label", label);
                    m.put("value", score);
                    m.put("max", max);
                    rows.add(m);
                }
            } else if ("mbti".equals(type) && root.has("scores") && root.get("scores").isObject()) {
                JsonNode scores = root.get("scores");
                String[][] dims = {{"E", "I"}, {"S", "N"}, {"T", "F"}, {"J", "P"}};
                for (String[] d : dims) {
                    int a = scores.has(d[0]) ? scores.get(d[0]).asInt(0) : 0;
                    int b = scores.has(d[1]) ? scores.get(d[1]).asInt(0) : 0;
                    int sum = a + b;
                    double leftPct = sum > 0 ? round1(100.0 * a / sum) : 50.0;
                    double rightPct = round1(100.0 - leftPct);
                    Map<String, Object> m = new HashMap<>();
                    m.put("rowType", "mbti_axis");
                    m.put("leftCode", d[0]);
                    m.put("rightCode", d[1]);
                    m.put("leftCount", a);
                    m.put("rightCount", b);
                    m.put("leftPct", leftPct);
                    m.put("rightPct", rightPct);
                    rows.add(m);
                }
            } else if ("values8".equals(type) && root.has("scores") && root.get("scores").isObject()) {
                JsonNode scores = root.get("scores");
                JsonNode labels = root.has("labels") ? root.get("labels") : null;
                String[] axes = {"econ", "dipl", "govt", "scty"};
                for (String axis : axes) {
                    double raw = scores.has(axis) ? scores.get(axis).asDouble(0) : 0;
                    double left = ("econ".equals(axis) || "govt".equals(axis)) ? raw : round1(100 - raw);
                    double right = round1(100 - left);
                    String leftName = axis;
                    String rightName = "";
                    if (labels != null && labels.has(axis) && labels.get(axis).isArray() && labels.get(axis).size() >= 2) {
                        leftName = labels.get(axis).get(0).asText(axis);
                        rightName = labels.get(axis).get(1).asText("");
                    }
                    Map<String, Object> m = new HashMap<>();
                    m.put("rowType", "values8_axis");
                    m.put("leftLabel", leftName);
                    m.put("rightLabel", rightName);
                    m.put("leftPct", left);
                    m.put("rightPct", right);
                    rows.add(m);
                }
            } else if (root.has("scores") && root.get("scores").isObject()) {
                JsonNode scores = root.get("scores");
                Iterator<String> keys = scores.fieldNames();
                double maxVal = 0;
                List<String> keyOrder = new ArrayList<>();
                while (keys.hasNext()) {
                    String k = keys.next();
                    keyOrder.add(k);
                    JsonNode n = scores.get(k);
                    if (n.isNumber()) {
                        double v = n.asDouble();
                        if (v > maxVal) maxVal = v;
                    }
                }
                if (maxVal <= 0) maxVal = 1;
                for (String k : keyOrder) {
                    JsonNode n = scores.get(k);
                    String text = n.isNumber() ? String.valueOf(n.asDouble()) : n.asText("");
                    Map<String, Object> m = new HashMap<>();
                    m.put("rowType", "kv");
                    m.put("key", k);
                    m.put("value", text);
                    if (n.isNumber()) {
                        m.put("numericValue", n.asDouble());
                        m.put("max", maxVal);
                    }
                    rows.add(m);
                }
            }
        } catch (Exception ignored) {
            // 返回已收集的空或部分行
        }
        return rows;
    }

    /** 与历史 /api/test-results/{id}/scores 的 lines 格式一致 */
    public static List<String> toDisplayLines(String testType, String resultJson, ObjectMapper objectMapper) {
        List<Map<String, Object>> rows = parseScoreRows(testType, resultJson, objectMapper);
        List<String> lines = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            String rt = String.valueOf(row.getOrDefault("rowType", ""));
            switch (rt) {
                case "enneagram" -> lines.add(row.get("label") + ": " + row.get("value"));
                case "mbti_axis" -> lines.add(row.get("leftCode") + "-" + row.get("rightCode") + ": "
                        + row.get("leftCode") + " " + row.get("leftCount") + " / "
                        + row.get("rightCode") + " " + row.get("rightCount"));
                case "values8_axis" -> lines.add(row.get("leftLabel") + " " + row.get("leftPct") + "% / "
                        + row.get("rightPct") + "% " + row.get("rightLabel"));
                case "kv" -> lines.add(row.get("key") + ": " + row.get("value"));
                default -> { }
            }
        }
        return lines;
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
