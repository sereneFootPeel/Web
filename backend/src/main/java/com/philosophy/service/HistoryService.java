package com.philosophy.service;

import com.philosophy.model.Content;
import com.philosophy.model.HistoryCountry;
import com.philosophy.model.HistoryEvent;
import com.philosophy.model.Philosopher;
import com.philosophy.model.School;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.HistoryCountryRepository;
import com.philosophy.repository.HistoryEventRepository;
import com.philosophy.repository.SchoolRepository;
import com.philosophy.util.DateUtils;
import com.philosophy.util.HistoryCenturyBucket;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

@Service
public class HistoryService {

    public static final int YEAR_MIN = -3000;
    public static final int YEAR_MAX = 2100;
    private static final int PHILOSOPHY_CARD_LIMIT = 200;
    private static final Map<String, Set<String>> COUNTRY_ALIASES = Map.ofEntries(
            Map.entry("US", Set.of("us", "usa", "unitedstates", "america", "american", "美国", "美利坚", "美利坚合众国")),
            Map.entry("BR", Set.of("br", "brazil", "brazilian", "巴西", "巴西人")),
            Map.entry("RU", Set.of("ru", "russia", "russian", "俄罗斯", "俄国", "俄国人")),
            Map.entry("RU_EMPIRE", Set.of("ruempire", "russianempire", "tsaristrussia", "imperialrussia", "俄国", "沙俄", "俄罗斯帝国")),
            Map.entry("SU", Set.of("su", "ussr", "sovietunion", "soviet", "苏联", "苏维埃", "苏维埃联盟", "苏维埃社会主义共和国联盟")),
            Map.entry("CN", Set.of("cn", "china", "chinese", "中国", "中国人", "中华")),
            Map.entry("KR", Set.of("kr", "korea", "southkorea", "southkorean", "韩国", "南韩", "大韩民国", "韩国人")),
            Map.entry("JP", Set.of("jp", "japan", "japanese", "日本", "日本人")),
            Map.entry("IN", Set.of("in", "india", "indian", "印度", "印度人")),
            Map.entry("IQ", Set.of("iq", "iraq", "iraqi", "伊拉克", "伊拉克人")),
            Map.entry("GB", Set.of("gb", "uk", "britain", "british", "greatbritain", "unitedkingdom", "english", "scottish", "welsh", "英国", "英格兰", "苏格兰", "威尔士", "不列颠", "联合王国")),
            Map.entry("DE", Set.of("de", "germany", "german", "德国", "德意志", "德国人")),
            Map.entry("GR", Set.of("gr", "greece", "greek", "hellenic", "希腊", "希腊人")),
            Map.entry("FR", Set.of("fr", "france", "french", "法国", "法国人")),
            Map.entry("PT", Set.of("pt", "portugal", "portuguese", "葡萄牙", "葡萄牙人")),
            Map.entry("ES", Set.of("es", "spain", "spanish", "西班牙", "西班牙人")),
            Map.entry("AH", Set.of("ah", "austriahungary", "austrohungary", "austrohungarian", "奥匈帝国", "奥匈", "双元帝国")),
            Map.entry("EG", Set.of("eg", "egypt", "egyptian", "埃及", "埃及人")),
            Map.entry("AU", Set.of("au", "australia", "australian", "澳大利亚", "澳洲", "澳大利亚人"))
    );

    private final HistoryCountryRepository countryRepository;
    private final HistoryEventRepository eventRepository;
    private final SchoolRepository schoolRepository;
    private final ContentRepository contentRepository;

    public HistoryService(HistoryCountryRepository countryRepository,
                          HistoryEventRepository eventRepository,
                          SchoolRepository schoolRepository,
                          ContentRepository contentRepository) {
        this.countryRepository = countryRepository;
        this.eventRepository = eventRepository;
        this.schoolRepository = schoolRepository;
        this.contentRepository = contentRepository;
    }

    public int clampYear(int year) {
        return Math.min(YEAR_MAX, Math.max(YEAR_MIN, year));
    }

    @Transactional(readOnly = true)
    public List<HistoryCountry> listAllCountriesOrdered() {
        return countryRepository == null ? List.of() : countryRepository.findAllByOrderByMapSlotAscIdAsc();
    }

    @Transactional(readOnly = true)
    public List<HistoryCountry> listVisibleCountriesForYear(int year) {
        HistoryCenturyBucket.YearRange bucket = HistoryCenturyBucket.bucketContaining(clampYear(year));
        List<HistoryCountry> visible = new ArrayList<>();
        for (HistoryCountry country : listAllCountriesOrdered()) {
            Long countryId = country.getId();
            if (countryId == null) {
                continue;
            }
            boolean hasEvent = listEventsForCountry(countryId).stream()
                    .map(HistoryEvent::getStartYear)
                    .map(DateUtils::extractTimelineYear)
                    .filter(Objects::nonNull)
                    .anyMatch(y -> HistoryCenturyBucket.sameBucket(y, bucket.start()));
            if (hasEvent) {
                visible.add(country);
            }
        }
        return visible;
    }

    @Transactional(readOnly = true)
    public Optional<HistoryCountry> getCountry(Long countryId) {
        if (countryId == null || countryRepository == null) {
            return Optional.empty();
        }
        return countryRepository.findById(countryId);
    }

    @Transactional(readOnly = true)
    public List<HistoryEvent> listEventsForCountry(Long countryId) {
        if (countryId == null || eventRepository == null) {
            return List.of();
        }
        List<HistoryEvent> events = eventRepository.findByCountry_IdOrderByStartYearAscIdAsc(countryId);
        return sortHistoryEvents(events);
    }

    @Transactional(readOnly = true)
    public List<HistoryEvent> listEventsForCountryInYearBucket(Long countryId, int year) {
        HistoryCenturyBucket.YearRange bucket = HistoryCenturyBucket.bucketContaining(clampYear(year));
        return listEventsForCountry(countryId).stream()
                .filter(event -> belongsToBucket(event, bucket))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HistoryEvent> listEventsForYearBucket(int year) {
        if (eventRepository == null) {
            return List.of();
        }
        HistoryCenturyBucket.YearRange bucket = HistoryCenturyBucket.bucketContaining(clampYear(year));
        return sortHistoryEvents(eventRepository.findAll()).stream()
                .filter(event -> belongsToBucket(event, bucket))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Content> listTimelineContentsForCountry(Long countryId) {
        if (countryId == null) {
            return List.of();
        }
        Optional<HistoryCountry> countryOpt = getCountry(countryId);
        if (countryOpt.isEmpty()) {
            return List.of();
        }

        List<Content> ordered = new ArrayList<>();
        for (Content content : listHistoryPhilosophyContentsInternal()) {
            if (philosopherBelongsToCountry(content.getPhilosopher(), countryOpt.get())) {
                ordered.add(content);
            }
        }
        return limitHistoryContents(ordered);
    }

    @Transactional(readOnly = true)
    public List<Content> listTimelineContentsForCountryInYearBucket(Long countryId, int year) {
        HistoryCenturyBucket.YearRange bucket = HistoryCenturyBucket.bucketContaining(clampYear(year));
        return listTimelineContentsForCountry(countryId).stream()
                .filter(content -> {
                    Philosopher philosopher = content.getPhilosopher();
                    Integer timelineYear = philosopher == null ? null : DateUtils.extractTimelineYear(philosopher.getBirthYear());
                    return timelineYear != null && HistoryCenturyBucket.sameBucket(timelineYear, bucket.start());
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Content> listTimelineContentsForYearBucket(int year) {
        HistoryCenturyBucket.YearRange bucket = HistoryCenturyBucket.bucketContaining(clampYear(year));
        List<Content> filtered = new ArrayList<>();
        for (Content content : listHistoryPhilosophyContents()) {
            Philosopher philosopher = content.getPhilosopher();
            Integer timelineYear = philosopher == null ? null : DateUtils.extractTimelineYear(philosopher.getBirthYear());
            if (timelineYear != null && HistoryCenturyBucket.sameBucket(timelineYear, bucket.start())) {
                filtered.add(content);
            }
        }
        return filtered;
    }

    @Transactional(readOnly = true)
    public CountryYearBounds computeCountryYearBounds(Long countryId) {
        List<Integer> mins = new ArrayList<>();
        List<Integer> maxs = new ArrayList<>();
        if (eventRepository != null) {
            eventRepository.minStartYearByCountryId(countryId)
                    .map(DateUtils::extractTimelineYear)
                    .ifPresent(mins::add);
            eventRepository.maxStartYearByCountryId(countryId)
                    .map(DateUtils::extractTimelineYear)
                    .ifPresent(maxs::add);
        }

        for (Content content : listTimelineContentsForCountry(countryId)) {
            Philosopher philosopher = content.getPhilosopher();
            Integer timelineYear = philosopher == null ? null : DateUtils.extractTimelineYear(philosopher.getBirthYear());
            if (timelineYear == null) {
                continue;
            }
            mins.add(timelineYear);
            maxs.add(timelineYear);
        }
        if (mins.isEmpty() || maxs.isEmpty()) {
            return new CountryYearBounds(null, null);
        }
        return new CountryYearBounds(Collections.min(mins), Collections.max(maxs));
    }

    @Transactional(readOnly = true)
    public List<Content> listHistoryPhilosophyContents() {
        return limitHistoryContents(listHistoryPhilosophyContentsInternal());
    }

    private List<Content> listHistoryPhilosophyContentsInternal() {
        if (schoolRepository == null || contentRepository == null) {
            return List.of();
        }
        List<School> allSchools = schoolRepository.findAll();
        if (allSchools.isEmpty()) {
            return List.of();
        }
        Set<Long> schoolIds = resolveHistoryEnabledSchoolIds(allSchools);
        if (schoolIds.isEmpty()) {
            return List.of();
        }
        List<Content> raw = contentRepository.findBySchoolIdsDirect(new ArrayList<>(schoolIds));

        Map<Long, Content> unique = new LinkedHashMap<>();
        for (Content content : raw) {
            if (content == null || content.getId() == null || content.isPrivate() || content.isBlocked()) {
                continue;
            }
            Philosopher philosopher = content.getPhilosopher();
            if (philosopher == null || philosopher.getBirthYear() == null) {
                continue;
            }
            unique.putIfAbsent(content.getId(), content);
        }

        List<Content> filtered = new ArrayList<>(unique.values());
        filtered.sort(Comparator
                .comparing((Content c) -> Optional.ofNullable(c.getPhilosopher())
                        .map(Philosopher::getBirthYear)
                        .orElse(Integer.MAX_VALUE))
                .thenComparing((Content c) -> c.isHistoryPinned() ? 1 : 0, Comparator.reverseOrder())
                .thenComparing(c -> c.getLikeCount() == null ? 0 : c.getLikeCount(), Comparator.reverseOrder())
                .thenComparing(Content::getId));
        return filtered;
    }

    private Set<Long> resolveHistoryEnabledSchoolIds(List<School> allSchools) {
        Set<Long> schoolIds = new HashSet<>();
        for (School school : allSchools) {
            if (!school.isHistoryEnabled() || school.getId() == null) {
                continue;
            }
            expandSchoolIds(school.getId(), true, allSchools, schoolIds);
        }
        return schoolIds;
    }

    private List<Content> limitHistoryContents(List<Content> contents) {
        if (contents.size() > PHILOSOPHY_CARD_LIMIT) {
            return contents.subList(0, PHILOSOPHY_CARD_LIMIT);
        }
        return contents;
    }

    private boolean belongsToBucket(HistoryEvent event, HistoryCenturyBucket.YearRange bucket) {
        if (event == null || bucket == null) {
            return false;
        }
        Integer timelineYear = DateUtils.extractTimelineYear(event.getStartYear());
        return timelineYear != null && HistoryCenturyBucket.sameBucket(timelineYear, bucket.start());
    }

    private List<HistoryEvent> sortHistoryEvents(List<HistoryEvent> events) {
        if (events == null || events.isEmpty()) {
            return List.of();
        }
        List<HistoryEvent> sorted = new ArrayList<>(events);
        sorted.sort(Comparator
                .comparing((HistoryEvent event) -> event == null ? Integer.MAX_VALUE : event.getStartYear())
                .thenComparing(event -> event == null || event.getId() == null ? Long.MAX_VALUE : event.getId()));
        return sorted;
    }

    static boolean philosopherBelongsToCountry(Philosopher philosopher, HistoryCountry country) {
        if (philosopher == null || country == null) {
            return false;
        }
        String nationality = philosopher.getNationality();
        if (nationality == null || nationality.isBlank()) {
            return false;
        }

        String countryCode = Optional.ofNullable(country.getCountryCode()).orElse("").trim().toUpperCase(Locale.ROOT);
        if (countryCode.isEmpty()) {
            return false;
        }

        Set<String> exactTokens = new LinkedHashSet<>();
        addNormalizedToken(exactTokens, country.getCountryCode());
        addNormalizedToken(exactTokens, country.getNameZh());
        addNormalizedToken(exactTokens, country.getNameEn());

        Set<String> aliases = COUNTRY_ALIASES.getOrDefault(countryCode, Set.of());
        String normalizedNationality = normalizeGeoToken(nationality);
        if (normalizedNationality.isEmpty()) {
            return false;
        }

        for (String part : nationality.split("[,，;/；、|]+")) {
            String normalizedPart = normalizeGeoToken(part);
            if (matchesCountryToken(normalizedPart, exactTokens, aliases)) {
                return true;
            }
        }
        return matchesCountryToken(normalizedNationality, exactTokens, aliases);
    }

    private static boolean matchesCountryToken(String normalizedValue, Set<String> exactTokens, Set<String> aliases) {
        if (normalizedValue == null || normalizedValue.isEmpty()) {
            return false;
        }
        if (exactTokens.contains(normalizedValue) || aliases.contains(normalizedValue)) {
            return true;
        }
        for (String token : exactTokens) {
            if (shouldUseContainsMatch(token) && normalizedValue.contains(token)) {
                return true;
            }
        }
        for (String alias : aliases) {
            if (shouldUseContainsMatch(alias) && normalizedValue.contains(alias)) {
                return true;
            }
        }
        return false;
    }

    private static boolean shouldUseContainsMatch(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        boolean asciiAlphaNumOnly = true;
        for (int i = 0; i < token.length(); i++) {
            char ch = token.charAt(i);
            if (ch > 0x7F || !Character.isLetterOrDigit(ch)) {
                asciiAlphaNumOnly = false;
                break;
            }
        }
        if (asciiAlphaNumOnly) {
            return token.length() >= 3;
        }
        return token.length() >= 2;
    }

    private static void addNormalizedToken(Set<String> out, String value) {
        String normalized = normalizeGeoToken(value);
        if (!normalized.isEmpty()) {
            out.add(normalized);
        }
    }

    private static String normalizeGeoToken(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder(value.length());
        for (char ch : value.toCharArray()) {
            if (Character.isLetterOrDigit(ch)) {
                sb.append(Character.toLowerCase(ch));
            }
        }
        return sb.toString();
    }

    /**
     * 将根流派 id 展开为包含子流派后的全部 school id。
     */
    public void expandSchoolIds(Long rootSchoolId, boolean includeDescendants, List<School> allSchools, Set<Long> out) {
        if (rootSchoolId == null) {
            return;
        }
        if (!includeDescendants) {
            out.add(rootSchoolId);
            return;
        }
        Map<Long, List<Long>> childrenByParentId = new HashMap<>();
        for (School school : allSchools) {
            if (school.getParent() == null) {
                continue;
            }
            Long pid = school.getParent().getId();
            childrenByParentId.computeIfAbsent(pid, k -> new ArrayList<>()).add(school.getId());
        }
        ArrayDeque<Long> queue = new ArrayDeque<>();
        queue.add(rootSchoolId);
        while (!queue.isEmpty()) {
            Long id = queue.poll();
            if (!out.add(id)) {
                continue;
            }
            List<Long> children = childrenByParentId.getOrDefault(id, List.of());
            queue.addAll(children);
        }
    }

    public record CountryYearBounds(Integer minYear, Integer maxYear) {
    }

    public static String previewText(String text, int maxLen) {
        if (text == null) {
            return "";
        }
        String trimmed = text.strip();
        if (trimmed.length() <= maxLen) {
            return trimmed;
        }
        return trimmed.substring(0, maxLen) + "…";
    }

    public static String philosopherDateRange(Philosopher philosopher) {
        if (philosopher == null) {
            return "";
        }
        return DateUtils.formatBirthYearToDateRange(philosopher.getBirthYear(), philosopher.getDeathYear());
    }
}
