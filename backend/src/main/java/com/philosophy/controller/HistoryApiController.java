package com.philosophy.controller;

import com.philosophy.model.Content;
import com.philosophy.model.HistoryCountry;
import com.philosophy.model.HistoryEvent;
import com.philosophy.model.HistoryMapSlot;
import com.philosophy.model.Philosopher;
import com.philosophy.model.School;
import com.philosophy.service.HistoryService;
import com.philosophy.service.TranslationService;
import com.philosophy.util.DateUtils;
import com.philosophy.util.HistoryCenturyBucket;
import com.philosophy.util.LanguageUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/history")
public class HistoryApiController {

    private final HistoryService historyService;
    private final TranslationService translationService;
    private final LanguageUtil languageUtil;

    public HistoryApiController(HistoryService historyService,
                                TranslationService translationService,
                                LanguageUtil languageUtil) {
        this.historyService = historyService;
        this.translationService = translationService;
        this.languageUtil = languageUtil;
    }

    @GetMapping("/snapshot")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> snapshot(@RequestParam(value = "year", required = false) Integer year,
                                                        @RequestParam(value = "activeCountryId", required = false) Long activeCountryId,
                                                        @RequestParam(value = "activeRegionId", required = false) Long activeRegionId) {
        Long active = activeCountryId != null ? activeCountryId : activeRegionId;
        int y = year == null ? 1000 : historyService.clampYear(year);
        List<HistoryCountry> countries = historyService.listVisibleCountriesForYear(y);
        List<Map<String, Object>> markers = new ArrayList<>();
        for (HistoryCountry country : countries) {
            HistoryMapSlot slot = country.getMapSlot() != null ? country.getMapSlot() : HistoryMapSlot.EUROPE;
            Map<String, Object> marker = new HashMap<>();
            marker.put("countryId", country.getId());
            marker.put("regionId", country.getId());
            marker.put("countryCode", country.getCountryCode());
            marker.put("code", country.getCountryCode());
            marker.put("nameZh", country.getNameZh());
            marker.put("nameEn", country.getNameEn());
            marker.put("lon", country.getMarkerLon() != null ? country.getMarkerLon() : slot.getMarkerLon());
            marker.put("lat", country.getMarkerLat() != null ? country.getMarkerLat() : slot.getMarkerLat());
            markers.add(marker);
        }
        Map<String, Object> body = new HashMap<>();
        body.put("year", y);
        body.put("markers", markers);
        body.put("activeCountryId", active);
        body.put("activeRegionId", active);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/country/{countryId}/cards")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> countryCards(@PathVariable("countryId") Long countryId,
                                                            @RequestParam(value = "year", required = false) Integer year,
                                                            HttpServletRequest request) {
        Optional<HistoryCountry> countryOpt = historyService.getCountry(countryId);
        if (countryOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        int y = year == null ? 1000 : historyService.clampYear(year);
        String lang = languageUtil.getLanguage(request);

        List<Map<String, Object>> eventDtos = new ArrayList<>();
        for (HistoryEvent event : historyService.listEventsForCountry(countryId)) {
            eventDtos.add(toEventRow(event, lang));
        }

        List<Map<String, Object>> cardDtos = new ArrayList<>();
        for (Content content : historyService.listTimelineContentsForCountry(countryId)) {
            Map<String, Object> row = toContentRow(content, lang);
            if (row != null) {
                cardDtos.add(row);
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("countryId", countryId);
        body.put("regionId", countryId);
        body.put("year", y);
        body.put("bucketStart", null);
        body.put("bucketEnd", null);
        body.put("events", eventDtos);
        body.put("philosophyCards", cardDtos);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/period/cards")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> periodCards(@RequestParam("year") Integer year,
                                                           HttpServletRequest request) {
        int y = historyService.clampYear(year == null ? 1000 : year);
        HistoryCenturyBucket.YearRange bucket = HistoryCenturyBucket.bucketContaining(y);
        String lang = languageUtil.getLanguage(request);

        List<Map<String, Object>> eventDtos = new ArrayList<>();
        for (HistoryEvent event : historyService.listEventsForYearBucket(y)) {
            eventDtos.add(toEventRow(event, lang));
        }

        List<Map<String, Object>> cardDtos = new ArrayList<>();
        for (Content content : historyService.listTimelineContentsForYearBucket(y)) {
            Map<String, Object> row = toContentRow(content, lang);
            if (row != null) {
                cardDtos.add(row);
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("year", y);
        body.put("bucketStart", bucket.start());
        body.put("bucketEnd", bucket.end());
        body.put("events", eventDtos);
        body.put("philosophyCards", cardDtos);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/country/{countryId}/years")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> countryYears(@PathVariable("countryId") Long countryId) {
        if (historyService.getCountry(countryId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        HistoryService.CountryYearBounds bounds = historyService.computeCountryYearBounds(countryId);
        Map<String, Object> body = new HashMap<>();
        body.put("countryId", countryId);
        body.put("regionId", countryId);
        body.put("minYear", bounds.minYear());
        body.put("maxYear", bounds.maxYear());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/region/{regionId}/cards")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> regionCardsLegacy(@PathVariable("regionId") Long regionId,
                                                                 @RequestParam(value = "year", required = false) Integer year,
                                                                 HttpServletRequest request) {
        return countryCards(regionId, year, request);
    }

    @GetMapping("/region/{regionId}/years")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> regionYearsLegacy(@PathVariable("regionId") Long regionId) {
        return countryYears(regionId);
    }

    private Map<String, Object> toEventRow(HistoryEvent event, String lang) {
        Integer normalizedStartDate = DateUtils.convertYearToDateFormat(event.getStartYear());
        Map<String, Object> row = new HashMap<>();
        row.put("id", event.getId());
        row.put("summary", "en".equals(lang) && event.getSummaryEn() != null && !event.getSummaryEn().isBlank()
                ? event.getSummaryEn() : event.getSummaryZh());
        row.put("summaryZh", event.getSummaryZh());
        row.put("summaryEn", event.getSummaryEn());
        row.put("startYear", event.getStartYear());
        row.put("sortDate", normalizedStartDate);
        row.put("dateLabel", DateUtils.formatHistoricalDate(normalizedStartDate));
        if (event.getCountry() != null) {
            row.put("regionId", event.getCountry().getId());
            row.put("regionNameZh", event.getCountry().getNameZh());
            row.put("regionNameEn", event.getCountry().getNameEn());
        }
        return row;
    }

    private Map<String, Object> toContentRow(Content content, String lang) {
        Philosopher philosopher = content.getPhilosopher();
        if (philosopher == null || philosopher.getBirthYear() == null) {
            return null;
        }
        Integer normalizedBirthDate = DateUtils.convertYearToDateFormat(philosopher.getBirthYear());
        Map<String, Object> row = new HashMap<>();
        row.put("id", content.getId());
        row.put("content", HistoryService.previewText(content.getContent(), 480));
        row.put("contentEn", HistoryService.previewText(content.getContentEn() != null && !content.getContentEn().isBlank() ? content.getContentEn() : content.getContent(), 480));
        row.put("sortDate", normalizedBirthDate);
        row.put("dateLabel", null);
        Map<String, Object> philosopherRow = new HashMap<>();
        philosopherRow.put("id", philosopher.getId());
        philosopherRow.put("name", philosopher.getName());
        philosopherRow.put("nameEn", philosopher.getNameEn());
        philosopherRow.put("displayName", translationService.getPhilosopherDisplayName(philosopher, lang));
        philosopherRow.put("dateRange", HistoryService.philosopherDateRange(philosopher));
        row.put("philosopher", philosopherRow);
        School school = content.getSchool();
        if (school != null) {
            Map<String, Object> schoolRow = new HashMap<>();
            schoolRow.put("id", school.getId());
            schoolRow.put("name", school.getName());
            schoolRow.put("nameEn", school.getNameEn());
            schoolRow.put("displayName", translationService.getSchoolDisplayName(school, lang));
            if (school.getParent() != null) {
                Map<String, Object> parentRow = new HashMap<>();
                parentRow.put("id", school.getParent().getId());
                parentRow.put("name", school.getParent().getName());
                parentRow.put("nameEn", school.getParent().getNameEn());
                parentRow.put("displayName", translationService.getSchoolDisplayName(school.getParent(), lang));
                schoolRow.put("parent", parentRow);
            }
            row.put("school", schoolRow);
        }
        row.put("likeCount", content.getLikeCount());
        row.put("historyPinned", content.isHistoryPinned());
        return row;
    }
}
