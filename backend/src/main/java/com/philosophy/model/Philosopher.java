package com.philosophy.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.philosophy.util.DateUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "philosophers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Philosopher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "哲学家姓名不能为空")
    @Size(max = 100, message = "姓名长度不能超过100个字符")
    @Column(nullable = false, length = 100)
    private String name;

    // 基本验证方法
    public boolean isValidName() {
        return name != null && !name.trim().isEmpty();
    }

    @Column(name = "birth_year")
    private Integer birthYear;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @JsonIgnore
    @Column(name = "image_data", columnDefinition = "LONGBLOB")
    private byte[] imageData;

    @Size(max = 255, message = "图片类型长度不能超过255个字符")
    @JsonIgnore
    @Column(name = "image_content_type", length = 255)
    private String imageContentType;

    @Size(max = 255, message = "图片文件名长度不能超过255个字符")
    @JsonIgnore
    @Column(name = "image_file_name", length = 255)
    private String imageFileName;

    @Transient
    @JsonIgnore
    private boolean clearImageRequested;

    @Size(max = 10000, message = "传记长度不能超过10000个字符")
    @Column(name = "biography", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "death_year")
    private Integer deathYear;

    @Size(max = 100, message = "国籍长度不能超过100个字符")
    @Column(name = "nationality", length = 100)
    private String nationality;

    @Size(max = 10000, message = "英文传记长度不能超过10000个字符")
    @Column(name = "bio_en", columnDefinition = "TEXT")
    private String bioEn;

    @Size(max = 100, message = "英文姓名长度不能超过100个字符")
    @Column(name = "name_en", length = 100)
    private String nameEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "philosopher_school",
            joinColumns = @JoinColumn(name = "philosopher_id"),
            inverseJoinColumns = @JoinColumn(name = "school_id")
    )
    @JsonManagedReference("school-philosophers")
    private List<School> schools = new ArrayList<>();

    @OneToMany(mappedBy = "philosopher", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH})
    @JsonManagedReference("philosopher-content")
    private List<Content> contents = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    // 构造函数、getter和setter
    public Philosopher() {
    }

    public Philosopher(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getBirthYear() {
        return birthYear;
    }

    public void setBirthYear(Integer birthYear) {
        this.birthYear = birthYear;
    }

    public String getImageUrl() {
        if (!hasImage() || id == null) {
            return null;
        }
        return "/api/philosophers/" + id + "/image";
    }

    public void setImageUrl(String imageUrl) {
        // 兼容旧调用：图片已改为数据库存储，不再接受外部 URL 持久化。
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }


    public String getImageContentType() {
        return imageContentType;
    }

    public void setImageContentType(String imageContentType) {
        this.imageContentType = imageContentType;
    }

    public String getImageFileName() {
        return imageFileName;
    }

    public void setImageFileName(String imageFileName) {
        this.imageFileName = imageFileName;
    }

    public boolean hasImage() {
        return (imageContentType != null && !imageContentType.isBlank())
            || (imageFileName != null && !imageFileName.isBlank());
    }

    public void clearImage() {
        this.imageData = null;
        this.imageContentType = null;
        this.imageFileName = null;
    }

    public boolean isClearImageRequested() {
        return clearImageRequested;
    }

    public void setClearImageRequested(boolean clearImageRequested) {
        this.clearImageRequested = clearImageRequested;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getDeathYear() {
        return deathYear;
    }

    public void setDeathYear(Integer deathYear) {
        this.deathYear = deathYear;
    }

    @JsonProperty("formattedDate")
    public String getFormattedDate() {
        return DateUtils.formatBirthYearToDateRange(this.birthYear, this.deathYear);
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getBioEn() {
        return bioEn;
    }

    public void setBioEn(String bioEn) {
        this.bioEn = bioEn;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<School> getSchools() {
        return schools;
    }

    public void setSchools(List<School> schools) {
        this.schools = schools;
    }

    public void addSchool(School school) {
        this.schools.add(school);
        school.getPhilosophers().add(this);
    }

    public void removeSchool(School school) {
        this.schools.remove(school);
        school.getPhilosophers().remove(this);
    }

    public List<Content> getContents() {
        return contents;
    }

    public void setContents(List<Content> contents) {
        this.contents = contents;
    }

    public void addContent(Content content) {
        this.contents.add(content);
        content.setPhilosopher(this);
    }

    public void removeContent(Content content) {
        this.contents.remove(content);
        content.setPhilosopher(null);
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

    public Integer getLikeCount() {
        return (likeCount == null) ? 0 : likeCount;
    }

    public void setLikeCount(Integer likeCount) {
        this.likeCount = likeCount;
    }

    @Override
    public String toString() {
        return "Philosopher{" +
                "id=" + id +
                ", name='" + name + "'" +
                ", birthYear=" + birthYear +
                "}";
    }
}
