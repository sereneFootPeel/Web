-- Runtime schema bootstrap for the history module when Flyway is disabled.
-- Keep this file idempotent so it can run on every application startup.

CREATE TABLE IF NOT EXISTS history_country (
    id BIGINT NOT NULL AUTO_INCREMENT,
    country_code VARCHAR(32) NOT NULL,
    name_zh VARCHAR(200) NULL,
    name_en VARCHAR(200) NULL,
    map_slot VARCHAR(32) NOT NULL,
    marker_lon DOUBLE NULL,
    marker_lat DOUBLE NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    CONSTRAINT pk_history_country PRIMARY KEY (id),
    CONSTRAINT uk_history_country_country_code UNIQUE (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS history_event (
    id BIGINT NOT NULL AUTO_INCREMENT,
    country_id BIGINT NOT NULL,
    summary_zh TEXT NOT NULL,
    summary_en TEXT NULL,
    start_year INT NOT NULL,
    start_date_text VARCHAR(255) NULL,
    CONSTRAINT pk_history_event PRIMARY KEY (id),
    CONSTRAINT fk_history_event_country
        FOREIGN KEY (country_id) REFERENCES history_country (id)
        ON DELETE CASCADE,
    KEY idx_history_event_country_year (country_id, start_year, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @history_event_has_start_date_text := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'history_event'
      AND COLUMN_NAME = 'start_date_text'
);
SET @history_event_add_start_date_text_sql := IF(
    @history_event_has_start_date_text = 0,
    'ALTER TABLE history_event ADD COLUMN start_date_text VARCHAR(255) NULL AFTER start_year',
    'SELECT 1'
);
PREPARE history_event_add_start_date_text_stmt FROM @history_event_add_start_date_text_sql;
EXECUTE history_event_add_start_date_text_stmt;
DEALLOCATE PREPARE history_event_add_start_date_text_stmt;

CREATE TABLE IF NOT EXISTS history_philosophy_bucket_cache (
    id BIGINT NOT NULL AUTO_INCREMENT,
    country_id BIGINT NOT NULL,
    bucket_start_year INT NOT NULL,
    bucket_end_year INT NOT NULL,
    content_id BIGINT NOT NULL,
    philosopher_id BIGINT NULL,
    score DOUBLE NOT NULL DEFAULT 0,
    updated_at DATETIME(6) NULL,
    CONSTRAINT pk_history_philosophy_bucket_cache PRIMARY KEY (id),
    CONSTRAINT uk_hpbc_country_bucket_content
        UNIQUE (country_id, bucket_start_year, bucket_end_year, content_id),
    CONSTRAINT fk_hpbc_country
        FOREIGN KEY (country_id) REFERENCES history_country (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_hpbc_content
        FOREIGN KEY (content_id) REFERENCES content (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_hpbc_philosopher
        FOREIGN KEY (philosopher_id) REFERENCES philosopher (id)
        ON DELETE SET NULL,
    KEY idx_hpbc_country_bucket (country_id, bucket_start_year, bucket_end_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

