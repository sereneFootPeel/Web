package com.philosophy.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "history_event")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private HistoryCountry country;

    @NotBlank
    @Column(name = "summary_zh", columnDefinition = "TEXT")
    private String summaryZh;

    @Column(name = "summary_en", columnDefinition = "TEXT")
    private String summaryEn;

    @Column(name = "start_year", nullable = false)
    private int startYear;

    @Column(name = "start_date_text", length = 255)
    private String startDateText;

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

    public String getSummaryZh() {
        return summaryZh;
    }

    public void setSummaryZh(String summaryZh) {
        this.summaryZh = summaryZh;
    }

    public String getSummaryEn() {
        return summaryEn;
    }

    public void setSummaryEn(String summaryEn) {
        this.summaryEn = summaryEn;
    }

    public int getStartYear() {
        return startYear;
    }

    public void setStartYear(int startYear) {
        this.startYear = startYear;
    }

    public String getStartDateText() {
        return startDateText;
    }

    public void setStartDateText(String startDateText) {
        this.startDateText = startDateText;
    }
}
