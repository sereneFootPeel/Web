package com.philosophy.config;

import com.philosophy.model.HistoryCountry;
import com.philosophy.model.HistoryEvent;
import com.philosophy.model.HistoryMapSlot;
import com.philosophy.repository.HistoryCountryRepository;
import com.philosophy.repository.HistoryEventRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@ConditionalOnProperty(name = "app.history.runtime-seed.enabled", havingValue = "true")
public class HistoryDataInitializer implements ApplicationRunner {

    private final HistoryCountryRepository countryRepository;
    private final HistoryEventRepository eventRepository;

    public HistoryDataInitializer(HistoryCountryRepository countryRepository,
                                  HistoryEventRepository eventRepository) {
        this.countryRepository = countryRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (countryRepository.count() > 0 || eventRepository.count() > 0) {
            return;
        }

        HistoryCountry us = country("US", "美国", "United States", HistoryMapSlot.NA_NORTH, -95.7129, 37.0902);
        HistoryCountry ru = country("RU", "俄罗斯", "Russia", HistoryMapSlot.ASIA_NORTH, 105.3188, 61.5240);
        HistoryCountry kr = country("KR", "韩国", "South Korea", HistoryMapSlot.ASIA_SOUTH, 127.7669, 35.9078);
        HistoryCountry gb = country("GB", "英国", "United Kingdom", HistoryMapSlot.EUROPE, -3.4360, 55.3781);
        HistoryCountry de = country("DE", "德国", "Germany", HistoryMapSlot.EUROPE, 10.4515, 51.1657);
        HistoryCountry gr = country("GR", "希腊", "Greece", HistoryMapSlot.EUROPE, 21.8243, 39.0742);
        HistoryCountry jp = country("JP", "日本", "Japan", HistoryMapSlot.ASIA_SOUTH, 138.2529, 36.2048);
        HistoryCountry fr = country("FR", "法国", "France", HistoryMapSlot.EUROPE, 2.2137, 46.2276);

        countryRepository.saveAll(List.of(us, ru, kr, gb, de, gr, jp, fr));

        eventRepository.saveAll(List.of(
            event(us, 1969, "阿波罗 11 号登月", "Apollo 11 Moon Landing"),
            event(ru, 1917, "俄国十月革命", "October Revolution"),
            event(kr, 1948, "大韩民国成立", "Founding of the Republic of Korea"),
            event(gb, 1940, "不列颠之战", "Battle of Britain"),
            event(de, 1989, "柏林墙倒塌", "Fall of the Berlin Wall"),
            event(gr, 1967, "希腊军政府时期开始", "Beginning of the Greek military junta"),
            event(jp, 1945, "第二次世界大战结束后的日本重建", "Post-war reconstruction of Japan"),
            event(fr, 1968, "法国五月风暴", "May 1968 in France")
        ));
    }

    private static HistoryCountry country(String code,
                                          String nameZh,
                                          String nameEn,
                                          HistoryMapSlot slot,
                                          double lon,
                                          double lat) {
        HistoryCountry country = new HistoryCountry();
        country.setCountryCode(code);
        country.setNameZh(nameZh);
        country.setNameEn(nameEn);
        country.setMapSlot(slot);
        country.setMarkerLon(lon);
        country.setMarkerLat(lat);
        return country;
    }

    private static HistoryEvent event(HistoryCountry country,
                                      int startYear,
                                      String summaryZh,
                                      String summaryEn) {
        HistoryEvent event = new HistoryEvent();
        event.setCountry(country);
        event.setStartYear(startYear);
        event.setSummaryZh(summaryZh);
        event.setSummaryEn(summaryEn);
        return event;
    }
}

