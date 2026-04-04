package com.philosophy.repository;

import com.philosophy.model.HistoryCountry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryCountryRepository extends JpaRepository<HistoryCountry, Long> {

    List<HistoryCountry> findAllByOrderByMapSlotAscIdAsc();

    boolean existsByCountryCode(String countryCode);

    Optional<HistoryCountry> findByCountryCode(String countryCode);
}
