package com.philosophy.controller;

import com.philosophy.model.HistoryCountry;
import com.philosophy.model.HistoryEvent;
import com.philosophy.repository.HistoryCountryRepository;
import com.philosophy.repository.HistoryEventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.TestingAuthenticationToken;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdminHistoryApiControllerTest {

    @Test
    void createAndUpdateEvent_preserveRawDateTextWhileSortingByParsedStartDate() {
        HistoryCountryRepository countryRepository = mock(HistoryCountryRepository.class);
        HistoryEventRepository eventRepository = mock(HistoryEventRepository.class);
        AdminHistoryApiController controller = new AdminHistoryApiController(countryRepository, eventRepository);

        HistoryCountry country = new HistoryCountry();
        country.setId(7L);
        country.setNameZh("英国");
        when(countryRepository.findById(7L)).thenReturn(Optional.of(country));

        when(eventRepository.save(any(HistoryEvent.class))).thenAnswer(invocation -> {
            HistoryEvent event = invocation.getArgument(0);
            if (event.getId() == null) {
                event.setId(99L);
            }
            return event;
        });

        TestingAuthenticationToken auth = new TestingAuthenticationToken("admin", "pw", "ROLE_ADMIN");
        ResponseEntity<Map<String, Object>> createResponse = controller.createEvent(auth, Map.of(
            "countryId", 7,
            "startYear", "1999 - 2000",
            "summaryZh", "千年交替"
        ));

        Map<String, Object> createBody = createResponse.getBody();
        assertNotNull(createBody);
        @SuppressWarnings("unchecked")
        Map<String, Object> createdEvent = (Map<String, Object>) createBody.get("event");
        assertNotNull(createdEvent);
        assertEquals(19990000, createdEvent.get("startYear"));
        assertEquals(19990000, createdEvent.get("sortDate"));
        assertEquals("1999 - 2000", createdEvent.get("startDateText"));
        assertEquals("1999 - 2000", createdEvent.get("startDateLabel"));

        HistoryEvent existing = new HistoryEvent();
        existing.setId(99L);
        existing.setCountry(country);
        existing.setSummaryZh("千年交替");
        existing.setStartYear(19990000);
        existing.setStartDateText("1999 - 2000");
        when(eventRepository.findById(99L)).thenReturn(Optional.of(existing));

        ResponseEntity<Map<String, Object>> updateResponse = controller.updateEvent(auth, 99L, Map.of(
            "startYear", "192BC"
        ));

        Map<String, Object> updateBody = updateResponse.getBody();
        assertNotNull(updateBody);
        @SuppressWarnings("unchecked")
        Map<String, Object> updatedEvent = (Map<String, Object>) updateBody.get("event");
        assertNotNull(updatedEvent);
        assertEquals(-1920000, updatedEvent.get("startYear"));
        assertEquals("192BC", updatedEvent.get("startDateText"));
        assertEquals("192BC", updatedEvent.get("startDateLabel"));
        assertTrue((Boolean) updateBody.get("success"));
    }
}

