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
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class HistoryServiceCountryMatchingTest {

    @Test
    void visibleCountriesOnlyReturnMarkersForCountriesWithEventsInTheSelectedBucket() {
        HistoryCountryRepository countryRepository = mock(HistoryCountryRepository.class);
        HistoryEventRepository eventRepository = mock(HistoryEventRepository.class);

        HistoryCountry gb = new HistoryCountry();
        gb.setId(1L);
        gb.setCountryCode("GB");
        HistoryCountry us = new HistoryCountry();
        us.setId(2L);
        us.setCountryCode("US");
        when(countryRepository.findAllByOrderByMapSlotAscIdAsc()).thenReturn(List.of(gb, us));

        HistoryEvent britishEvent = new HistoryEvent();
        britishEvent.setId(11L);
        britishEvent.setStartYear(1950);
        britishEvent.setCountry(gb);
        when(eventRepository.findByCountry_IdOrderByStartYearAscIdAsc(1L)).thenReturn(List.of(britishEvent));
        when(eventRepository.findByCountry_IdOrderByStartYearAscIdAsc(2L)).thenReturn(List.of());

        HistoryService service = new HistoryService(countryRepository, eventRepository, null, null);

        assertEquals(List.of(gb), service.listVisibleCountriesForYear(2000));
    }

    @Test
    void timelineContentsAreMatchedToTheirCountriesInsteadOfBeingGlobalAcrossRegions() {
        HistoryCountryRepository countryRepository = mock(HistoryCountryRepository.class);
        HistoryEventRepository eventRepository = mock(HistoryEventRepository.class);
        SchoolRepository schoolRepository = mock(SchoolRepository.class);
        ContentRepository contentRepository = mock(ContentRepository.class);

        HistoryCountry gb = new HistoryCountry();
        gb.setId(1L);
        gb.setCountryCode("GB");
        gb.setNameZh("英国");
        HistoryCountry us = new HistoryCountry();
        us.setId(2L);
        us.setCountryCode("US");
        us.setNameZh("美国");
        when(countryRepository.findById(1L)).thenReturn(Optional.of(gb));
        when(countryRepository.findById(2L)).thenReturn(Optional.of(us));

        School economics = new School();
        economics.setId(10L);
        economics.setName("经济学");
        economics.setHistoryEnabled(true);

        when(schoolRepository.findAll()).thenReturn(List.of(economics));

        Philosopher smith = new Philosopher();
        smith.setBirthYear(1723);
        smith.setNationality("British");
        Content britishContent = new Content();
        britishContent.setId(101L);
        britishContent.setSchool(economics);
        britishContent.setPhilosopher(smith);

        Philosopher james = new Philosopher();
        james.setBirthYear(1842);
        james.setNationality("American");
        Content americanContent = new Content();
        americanContent.setId(102L);
        americanContent.setSchool(economics);
        americanContent.setPhilosopher(james);

        when(contentRepository.findBySchoolIdsDirect(anyList())).thenReturn(List.of(britishContent, americanContent));

        HistoryService service = new HistoryService(countryRepository, eventRepository, schoolRepository, contentRepository);

        List<Long> gbIds = service.listTimelineContentsForCountry(1L).stream().map(Content::getId).toList();
        List<Long> usIds = service.listTimelineContentsForCountry(2L).stream().map(Content::getId).toList();

        assertEquals(List.of(101L), gbIds);
        assertEquals(List.of(102L), usIds);
    }
}
