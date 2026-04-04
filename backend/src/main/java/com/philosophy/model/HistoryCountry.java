package com.philosophy.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "history_country")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoryCountry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 32)
    @Column(name = "country_code", nullable = false, unique = true, length = 32)
    private String countryCode;

    @Size(max = 200)
    @Column(name = "name_zh", length = 200)
    private String nameZh;

    @Size(max = 200)
    @Column(name = "name_en", length = 200)
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(name = "map_slot", nullable = false, length = 32)
    private HistoryMapSlot mapSlot = HistoryMapSlot.EUROPE;

    @Column(name = "marker_lon")
    private Double markerLon;

    @Column(name = "marker_lat")
    private Double markerLat;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "country", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistoryEvent> events = new java.util.ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getNameZh() {
        return nameZh;
    }

    public void setNameZh(String nameZh) {
        this.nameZh = nameZh;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public HistoryMapSlot getMapSlot() {
        return mapSlot;
    }

    public void setMapSlot(HistoryMapSlot mapSlot) {
        this.mapSlot = mapSlot;
    }

    public Double getMarkerLon() {
        return markerLon;
    }

    public void setMarkerLon(Double markerLon) {
        this.markerLon = markerLon;
    }

    public Double getMarkerLat() {
        return markerLat;
    }

    public void setMarkerLat(Double markerLat) {
        this.markerLat = markerLat;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<HistoryEvent> getEvents() {
        return events;
    }

    public void setEvents(List<HistoryEvent> events) {
        this.events = events;
    }
}
