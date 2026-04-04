package com.philosophy.service;

import com.philosophy.model.HistoryCountry;
import com.philosophy.model.HistoryEvent;
import com.philosophy.model.HistoryMapSlot;
import com.philosophy.repository.CommentRepository;
import com.philosophy.repository.ContentRepository;
import com.philosophy.repository.ContentTranslationRepository;
import com.philosophy.repository.HistoryCountryRepository;
import com.philosophy.repository.HistoryEventRepository;
import com.philosophy.repository.LikeRepository;
import com.philosophy.repository.PhilosopherRepository;
import com.philosophy.repository.PhilosopherTranslationRepository;
import com.philosophy.repository.SchoolRepository;
import com.philosophy.repository.SchoolTranslationRepository;
import com.philosophy.repository.UserBlockRepository;
import com.philosophy.repository.UserContentEditRepository;
import com.philosophy.repository.UserFollowRepository;
import com.philosophy.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DataExportServiceHistoryExportTest {

    @Test
    void exportAllDataToCsv_includesHistoryCountryAndEventSections() {
        UserRepository userRepository = mock(UserRepository.class);
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        PhilosopherRepository philosopherRepository = mock(PhilosopherRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);
        CommentRepository commentRepository = mock(CommentRepository.class);
        LikeRepository likeRepository = mock(LikeRepository.class);
        UserContentEditRepository userContentEditRepository = mock(UserContentEditRepository.class);
        UserBlockRepository userBlockRepository = mock(UserBlockRepository.class);
        UserFollowRepository userFollowRepository = mock(UserFollowRepository.class);
        SchoolTranslationRepository schoolTranslationRepository = mock(SchoolTranslationRepository.class);
        ContentTranslationRepository contentTranslationRepository = mock(ContentTranslationRepository.class);
        PhilosopherTranslationRepository philosopherTranslationRepository = mock(PhilosopherTranslationRepository.class);
        HistoryCountryRepository historyCountryRepository = mock(HistoryCountryRepository.class);
        HistoryEventRepository historyEventRepository = mock(HistoryEventRepository.class);

        when(userRepository.findAll()).thenReturn(List.of());
        when(schoolRepository.findAll()).thenReturn(List.of());
        when(philosopherRepository.findAll()).thenReturn(List.of());
        when(contentRepository.findAll()).thenReturn(List.of());
        when(commentRepository.findAll()).thenReturn(List.of());
        when(likeRepository.findAll()).thenReturn(List.of());
        when(userContentEditRepository.findAll()).thenReturn(List.of());
        when(userBlockRepository.findAll()).thenReturn(List.of());
        when(userFollowRepository.findAll()).thenReturn(List.of());
        when(schoolTranslationRepository.findAll()).thenReturn(List.of());
        when(contentTranslationRepository.findAll()).thenReturn(List.of());
        when(philosopherTranslationRepository.findAll()).thenReturn(List.of());

        HistoryCountry country = new HistoryCountry();
        country.setId(1L);
        country.setCountryCode("US");
        country.setNameZh("美国");
        country.setNameEn("United States");
        country.setMapSlot(HistoryMapSlot.NA_NORTH);
        country.setMarkerLon(-95.7129);
        country.setMarkerLat(37.0902);

        HistoryEvent event = new HistoryEvent();
        event.setId(10L);
        event.setCountry(country);
        event.setStartYear(1776);
        event.setSummaryZh("独立宣言");
        event.setSummaryEn("Declaration of Independence");

        when(historyCountryRepository.findAllByOrderByMapSlotAscIdAsc()).thenReturn(List.of(country));
        when(historyEventRepository.findAll()).thenReturn(List.of(event));

        DataExportService service = new DataExportService(
            userRepository,
            schoolRepository,
            philosopherRepository,
            contentRepository,
            commentRepository,
            likeRepository,
            userContentEditRepository,
            userBlockRepository,
            userFollowRepository,
            schoolTranslationRepository,
            contentTranslationRepository,
            philosopherTranslationRepository,
            historyCountryRepository,
            historyEventRepository
        );

        String csv = service.exportAllDataToCsv();

        assertTrue(csv.contains("历史国家数据"));
        assertTrue(csv.contains("ID,国家代码,中文名称,英文名称,地图槽位,标记经度,标记纬度,创建时间,更新时间"));
        assertTrue(csv.contains("1,US,美国,United States,NA_NORTH,-95.7129,37.0902"));
        assertTrue(csv.contains("历史事件数据"));
        assertTrue(csv.contains("ID,国家ID,开始年份,中文摘要,英文摘要"));
        assertTrue(csv.contains("10,1,1776,独立宣言,Declaration of Independence"));
    }
}

