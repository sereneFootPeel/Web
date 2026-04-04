package com.philosophy.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "history_philosophy_bucket_cache",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_hpbc_country_bucket_content",
        columnNames = {"country_id", "bucket_start_year", "bucket_end_year", "content_id"}
    )
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoryPhilosophyBucketCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private HistoryCountry country;

    @Column(name = "bucket_start_year", nullable = false)
    private int bucketStartYear;

    @Column(name = "bucket_end_year", nullable = false)
    private int bucketEndYear;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "philosopher_id")
    private Philosopher philosopher;

    @Column(nullable = false)
    private double score = 0d;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HistoryCountry getCountry() {
        return country;
    }

    public void setCountry(HistoryCountry country) {
        this.country = country;
    }

    public int getBucketStartYear() {
        return bucketStartYear;
    }

    public void setBucketStartYear(int bucketStartYear) {
        this.bucketStartYear = bucketStartYear;
    }

    public int getBucketEndYear() {
        return bucketEndYear;
    }

    public void setBucketEndYear(int bucketEndYear) {
        this.bucketEndYear = bucketEndYear;
    }

    public Content getContent() {
        return content;
    }

    public void setContent(Content content) {
        this.content = content;
    }

    public Philosopher getPhilosopher() {
        return philosopher;
    }

    public void setPhilosopher(Philosopher philosopher) {
        this.philosopher = philosopher;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
