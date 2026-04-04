package com.philosophy.repository;

import com.philosophy.model.HistoryEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryEventRepository extends JpaRepository<HistoryEvent, Long> {

    List<HistoryEvent> findByCountry_IdOrderByStartYearAscIdAsc(Long countryId);

    @Query("SELECT MIN(e.startYear) FROM HistoryEvent e WHERE e.country.id = :cid")
    Optional<Integer> minStartYearByCountryId(@Param("cid") Long cid);

    @Query("SELECT MAX(e.startYear) FROM HistoryEvent e WHERE e.country.id = :cid")
    Optional<Integer> maxStartYearByCountryId(@Param("cid") Long cid);
}
