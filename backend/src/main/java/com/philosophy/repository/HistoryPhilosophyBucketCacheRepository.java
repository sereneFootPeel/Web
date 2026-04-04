package com.philosophy.repository;

import com.philosophy.model.HistoryPhilosophyBucketCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface HistoryPhilosophyBucketCacheRepository extends JpaRepository<HistoryPhilosophyBucketCache, Long> {

    @Query("""
        select c from HistoryPhilosophyBucketCache c
        left join fetch c.content content
        left join fetch content.philosopher philosopher
        left join fetch content.school school
        left join fetch school.parent parent
        where c.country.id = :countryId
        order by c.bucketStartYear asc, c.score desc, c.id asc
        """)
    List<HistoryPhilosophyBucketCache> findTimelineByCountryId(@Param("countryId") long countryId);

    List<HistoryPhilosophyBucketCache> findByCountry_IdAndBucketStartYearAndBucketEndYearOrderByScoreDesc(
        long countryId, int bucketStartYear, int bucketEndYear
    );

    @Modifying
    @Transactional
    @Query("delete from HistoryPhilosophyBucketCache c where c.country.id = :countryId")
    int deleteByCountry_Id(@Param("countryId") long countryId);

    @Modifying
    @Transactional
    @Query("delete from HistoryPhilosophyBucketCache c where c.country.id = :countryId and c.bucketStartYear = :start and c.bucketEndYear = :end")
    int deleteByCountryAndBucket(
        @Param("countryId") long countryId,
        @Param("start") int bucketStartYear,
        @Param("end") int bucketEndYear
    );
}
