package com.philosophy.controller;

import com.philosophy.model.HistoryCountry;
import com.philosophy.model.HistoryEvent;
import com.philosophy.model.HistoryMapSlot;
import com.philosophy.repository.HistoryCountryRepository;
import com.philosophy.repository.HistoryEventRepository;
import com.philosophy.util.DateUtils;
import com.philosophy.util.PinyinStringComparator;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/history")
public class AdminHistoryApiController {

    private static final String HISTORY_DATE_ERROR_MESSAGE = "startYear 不能为空，支持 1999 / 1999 - 2000 / 1999.1.1 - 2000.1.1 / 460BC";

    private final HistoryCountryRepository countryRepository;
    private final HistoryEventRepository eventRepository;
    private final PinyinStringComparator pinyinComparator = new PinyinStringComparator();

    private static final class ParsedHistoricalDate {
        private final String rawText;
        private final Integer sortDate;

        private ParsedHistoricalDate(String rawText, Integer sortDate) {
            this.rawText = rawText;
            this.sortDate = sortDate;
        }
    }

    public AdminHistoryApiController(
        HistoryCountryRepository countryRepository,
        HistoryEventRepository eventRepository
    ) {
        this.countryRepository = countryRepository;
        this.eventRepository = eventRepository;
    }

    private void requireAdmin(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("未登录");
        }
        boolean admin = auth.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (!admin) {
            throw new org.springframework.security.access.AccessDeniedException("需要管理员权限");
        }
    }

    private Long asLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.longValue();
        }
        String str = String.valueOf(value).trim();
        if (str.isEmpty()) {
            return null;
        }
        return Long.parseLong(str);
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String nullIfBlank(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private Double asDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            return n.doubleValue();
        }
        String str = nullIfBlank(asString(value));
        if (str == null) {
            return null;
        }
        return Double.parseDouble(str);
    }

    private String normalizeCountryCode(Object value) {
        String raw = nullIfBlank(asString(value));
        return raw == null ? null : raw.toUpperCase(Locale.ROOT);
    }

    private ParsedHistoricalDate asHistoricalDate(Object primaryValue, Object fallbackValue) {
        Object value = primaryValue != null ? primaryValue : fallbackValue;
        if (value == null) {
            return null;
        }
        if (value instanceof Number n) {
            Integer sortDate = DateUtils.convertYearToDateFormat(n.intValue());
            if (sortDate == null) {
                return null;
            }
            return new ParsedHistoricalDate(DateUtils.formatHistoricalDate(sortDate), sortDate);
        }
        String str = DateUtils.normalizeHistoricalDateText(asString(value));
        if (str == null) {
            return null;
        }
        Integer sortDate = DateUtils.parseHistoricalDate(str);
        if (sortDate == null) {
            return null;
        }
        return new ParsedHistoricalDate(str, sortDate);
    }

    private ResponseEntity<Map<String, Object>> bad(String msg) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", msg));
    }

    private Map<String, Object> countryMap(HistoryCountry c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("countryCode", c.getCountryCode());
        m.put("code", c.getCountryCode());
        m.put("nameZh", c.getNameZh());
        m.put("nameEn", c.getNameEn());
        HistoryMapSlot slot = c.getMapSlot();
        m.put("mapSlot", slot == null ? null : slot.name());
        m.put("mapSlotLabelZh", slot == null ? null : slot.getLabelZh());
        m.put("markerLon", c.getMarkerLon());
        m.put("markerLat", c.getMarkerLat());
        m.put("createdAt", c.getCreatedAt());
        m.put("updatedAt", c.getUpdatedAt());
        return m;
    }

    private Map<String, Object> eventMap(HistoryEvent e) {
        Map<String, Object> m = new HashMap<>();
        String startDateText = DateUtils.normalizeHistoricalDateText(e.getStartDateText());
        m.put("id", e.getId());
        m.put("countryId", e.getCountry() == null ? null : e.getCountry().getId());
        m.put("regionId", e.getCountry() == null ? null : e.getCountry().getId());
        m.put("summaryZh", e.getSummaryZh());
        m.put("summaryEn", e.getSummaryEn());
        m.put("startYear", e.getStartYear());
        m.put("sortDate", e.getStartYear());
        m.put("startDateText", startDateText);
        m.put("startDateLabel", DateUtils.resolveHistoricalDateLabel(startDateText, e.getStartYear()));
        return m;
    }

    private HistoryCountry requireCountry(Long id) {
        if (id == null) {
            return null;
        }
        return countryRepository.findById(id).orElse(null);
    }

    private String countrySortName(HistoryCountry country) {
        if (country == null) {
            return null;
        }
        if (country.getNameZh() != null && !country.getNameZh().isBlank()) {
            return country.getNameZh();
        }
        if (country.getNameEn() != null && !country.getNameEn().isBlank()) {
            return country.getNameEn();
        }
        return country.getCountryCode();
    }

    private long nullSafeId(Long id) {
        return id == null ? Long.MAX_VALUE : id;
    }

    private void sortCountries(List<HistoryCountry> countries) {
        countries.sort((left, right) -> {
            int byName = pinyinComparator.compare(countrySortName(left), countrySortName(right));
            if (byName != 0) {
                return byName;
            }
            return Long.compare(nullSafeId(left == null ? null : left.getId()), nullSafeId(right == null ? null : right.getId()));
        });
    }

    private void sortEvents(List<HistoryEvent> events) {
        events.sort((left, right) -> {
            int byCountry = pinyinComparator.compare(
                countrySortName(left == null ? null : left.getCountry()),
                countrySortName(right == null ? null : right.getCountry())
            );
            if (byCountry != 0) {
                return byCountry;
            }

            int leftStart = left == null ? Integer.MAX_VALUE : left.getStartYear();
            int rightStart = right == null ? Integer.MAX_VALUE : right.getStartYear();
            if (leftStart != rightStart) {
                return Integer.compare(leftStart, rightStart);
            }

            return Long.compare(nullSafeId(left == null ? null : left.getId()), nullSafeId(right == null ? null : right.getId()));
        });
    }

    // --- countries ---

    @GetMapping("/countries")
    public ResponseEntity<Map<String, Object>> listCountries(Authentication auth) {
        requireAdmin(auth);
        List<HistoryCountry> list = countryRepository.findAll(Sort.by(Sort.Direction.ASC, "mapSlot", "id"));
        sortCountries(list);
        return ResponseEntity.ok(Map.of("countries", list.stream().map(this::countryMap).toList()));
    }

    /** 兼容旧前端：与 /countries 相同 */
    @GetMapping("/regions")
    public ResponseEntity<Map<String, Object>> listRegionsLegacy(Authentication auth) {
        requireAdmin(auth);
        List<HistoryCountry> list = countryRepository.findAll(Sort.by(Sort.Direction.ASC, "mapSlot", "id"));
        sortCountries(list);
        return ResponseEntity.ok(Map.of("regions", list.stream().map(this::countryMap).toList()));
    }

    @PostMapping("/countries")
    @Transactional
    public ResponseEntity<Map<String, Object>> createCountry(Authentication auth, @RequestBody Map<String, Object> body) {
        requireAdmin(auth);
        return bad("历史国家已改为只读，请直接编辑历史事件并归类到现有国家");
    }

    @PutMapping("/countries/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateCountry(
        Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body
    ) {
        requireAdmin(auth);
        return bad("历史国家已改为只读，请直接编辑历史事件并归类到现有国家");
    }

    @DeleteMapping("/countries/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteCountry(Authentication auth, @PathVariable Long id) {
        requireAdmin(auth);
        return bad("历史国家已改为只读，不能删除");
    }

    // --- events ---

    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> listEvents(
        Authentication auth,
        @RequestParam(required = false) Long countryId,
        @RequestParam(required = false) Long regionId
    ) {
        requireAdmin(auth);
        Long filter = countryId != null ? countryId : regionId;
        List<HistoryEvent> list = filter == null
            ? eventRepository.findAll(Sort.by(Sort.Order.asc("country.id"), Sort.Order.asc("startYear"), Sort.Order.asc("id")))
            : eventRepository.findByCountry_IdOrderByStartYearAscIdAsc(filter);
        sortEvents(list);
        return ResponseEntity.ok(Map.of("events", list.stream().map(this::eventMap).toList()));
    }

    @PostMapping("/events")
    @Transactional
    public ResponseEntity<Map<String, Object>> createEvent(Authentication auth, @RequestBody Map<String, Object> body) {
        requireAdmin(auth);
        Long countryId = asLong(body.get("countryId"));
        if (countryId == null) {
            countryId = asLong(body.get("regionId"));
        }
        HistoryCountry country = requireCountry(countryId);
        if (country == null) {
            return bad("国家条目不存在");
        }
        String summaryZh = nullIfBlank(asString(body.get("summaryZh")));
        if (summaryZh == null) {
            return bad("summaryZh 不能为空");
        }
        ParsedHistoricalDate start = asHistoricalDate(body.get("startDateText"), body.get("startYear"));
        if (start == null) {
            return bad(HISTORY_DATE_ERROR_MESSAGE);
        }
        HistoryEvent e = new HistoryEvent();
        e.setCountry(country);
        e.setSummaryZh(summaryZh);
        e.setSummaryEn(nullIfBlank(asString(body.get("summaryEn"))));
        e.setStartYear(start.sortDate);
        e.setStartDateText(start.rawText);
        HistoryEvent saved = eventRepository.save(e);
        return ResponseEntity.ok(Map.of("success", true, "event", eventMap(saved)));
    }

    @PutMapping("/events/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateEvent(
        Authentication auth, @PathVariable Long id, @RequestBody Map<String, Object> body
    ) {
        requireAdmin(auth);
        HistoryEvent e = eventRepository.findById(id).orElse(null);
        if (e == null) {
            return bad("事件不存在");
        }
        if (body.containsKey("countryId") || body.containsKey("regionId")) {
            Long cid = asLong(body.get("countryId"));
            if (cid == null) {
                cid = asLong(body.get("regionId"));
            }
            HistoryCountry country = requireCountry(cid);
            if (country == null) {
                return bad("国家条目不存在");
            }
            e.setCountry(country);
        }
        if (body.containsKey("summaryZh")) {
            String summaryZh = nullIfBlank(asString(body.get("summaryZh")));
            if (summaryZh == null) {
                return bad("summaryZh 不能为空");
            }
            e.setSummaryZh(summaryZh);
        }
        if (body.containsKey("summaryEn")) {
            e.setSummaryEn(nullIfBlank(asString(body.get("summaryEn"))));
        }
        if (body.containsKey("startYear") || body.containsKey("startDateText")) {
            ParsedHistoricalDate start = asHistoricalDate(body.get("startDateText"), body.get("startYear"));
            if (start == null) {
                return bad(HISTORY_DATE_ERROR_MESSAGE);
            }
            e.setStartYear(start.sortDate);
            e.setStartDateText(start.rawText);
        }
        HistoryEvent saved = eventRepository.save(e);
        return ResponseEntity.ok(Map.of("success", true, "event", eventMap(saved)));
    }

    @DeleteMapping("/events/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteEvent(Authentication auth, @PathVariable Long id) {
        requireAdmin(auth);
        eventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
