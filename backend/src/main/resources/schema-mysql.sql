-- Runtime schema maintenance.
-- History and psychological-test modules have been removed.
-- Drop their tables and columns on startup, and keep philosopher image columns.

SET @contents_drop_history_country_fk_sql := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE contents DROP FOREIGN KEY fk_contents_history_country',
        'SELECT 1'
    )
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'contents'
      AND CONSTRAINT_NAME = 'fk_contents_history_country'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
PREPARE contents_drop_history_country_fk_stmt FROM @contents_drop_history_country_fk_sql;
EXECUTE contents_drop_history_country_fk_stmt;
DEALLOCATE PREPARE contents_drop_history_country_fk_stmt;

SET @contents_drop_history_country_idx_sql := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE contents DROP INDEX idx_contents_history_country',
        'SELECT 1'
    )
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'contents'
      AND INDEX_NAME = 'idx_contents_history_country'
);
PREPARE contents_drop_history_country_idx_stmt FROM @contents_drop_history_country_idx_sql;
EXECUTE contents_drop_history_country_idx_stmt;
DEALLOCATE PREPARE contents_drop_history_country_idx_stmt;

SET @contents_drop_history_country_id_sql := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE contents DROP COLUMN history_country_id',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'contents'
      AND COLUMN_NAME = 'history_country_id'
);
PREPARE contents_drop_history_country_id_stmt FROM @contents_drop_history_country_id_sql;
EXECUTE contents_drop_history_country_id_stmt;
DEALLOCATE PREPARE contents_drop_history_country_id_stmt;

SET @contents_drop_history_pinned_sql := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE contents DROP COLUMN history_pinned',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'contents'
      AND COLUMN_NAME = 'history_pinned'
);
PREPARE contents_drop_history_pinned_stmt FROM @contents_drop_history_pinned_sql;
EXECUTE contents_drop_history_pinned_stmt;
DEALLOCATE PREPARE contents_drop_history_pinned_stmt;

SET @schools_drop_history_enabled_sql := (
    SELECT IF(
        COUNT(*) > 0,
        'ALTER TABLE schools DROP COLUMN history_enabled',
        'SELECT 1'
    )
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'schools'
      AND COLUMN_NAME = 'history_enabled'
);
PREPARE schools_drop_history_enabled_stmt FROM @schools_drop_history_enabled_sql;
EXECUTE schools_drop_history_enabled_stmt;
DEALLOCATE PREPARE schools_drop_history_enabled_stmt;

DROP TABLE IF EXISTS history_philosophy_bucket_cache;
DROP TABLE IF EXISTS history_event;
DROP TABLE IF EXISTS history_country_school_scope;
DROP TABLE IF EXISTS history_country;
DROP TABLE IF EXISTS test_results;

SET @philosophers_has_image_data := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'philosophers'
      AND COLUMN_NAME = 'image_data'
);
SET @philosophers_add_image_data_sql := IF(
    @philosophers_has_image_data = 0,
    'ALTER TABLE philosophers ADD COLUMN image_data LONGBLOB NULL',
    'SELECT 1'
);
PREPARE philosophers_add_image_data_stmt FROM @philosophers_add_image_data_sql;
EXECUTE philosophers_add_image_data_stmt;
DEALLOCATE PREPARE philosophers_add_image_data_stmt;

SET @philosophers_has_image_content_type := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'philosophers'
      AND COLUMN_NAME = 'image_content_type'
);
SET @philosophers_add_image_content_type_sql := IF(
    @philosophers_has_image_content_type = 0,
    'ALTER TABLE philosophers ADD COLUMN image_content_type VARCHAR(255) NULL AFTER image_data',
    'SELECT 1'
);
PREPARE philosophers_add_image_content_type_stmt FROM @philosophers_add_image_content_type_sql;
EXECUTE philosophers_add_image_content_type_stmt;
DEALLOCATE PREPARE philosophers_add_image_content_type_stmt;

SET @philosophers_has_image_file_name := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'philosophers'
      AND COLUMN_NAME = 'image_file_name'
);
SET @philosophers_add_image_file_name_sql := IF(
    @philosophers_has_image_file_name = 0,
    'ALTER TABLE philosophers ADD COLUMN image_file_name VARCHAR(255) NULL AFTER image_content_type',
    'SELECT 1'
);
PREPARE philosophers_add_image_file_name_stmt FROM @philosophers_add_image_file_name_sql;
EXECUTE philosophers_add_image_file_name_stmt;
DEALLOCATE PREPARE philosophers_add_image_file_name_stmt;

-- Forum boards, threads, and replies.
CREATE TABLE IF NOT EXISTS forum_categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    slug VARCHAR(40) NOT NULL,
    name VARCHAR(80) NOT NULL,
    name_en VARCHAR(80) NOT NULL,
    description VARCHAR(255) NULL,
    description_en VARCHAR(255) NULL,
    sort_order INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_forum_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_threads (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    title VARCHAR(80) NOT NULL,
    body TEXT NOT NULL,
    reply_count INT NOT NULL,
    view_count INT NOT NULL,
    pinned BIT(1) NOT NULL,
    locked BIT(1) NOT NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    last_activity_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_forum_threads_activity (pinned, last_activity_at, id),
    KEY idx_forum_threads_category (category_id, pinned, last_activity_at),
    KEY idx_forum_threads_user (user_id),
    CONSTRAINT fk_forum_threads_category FOREIGN KEY (category_id) REFERENCES forum_categories (id),
    CONSTRAINT fk_forum_threads_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forum_replies (
    id BIGINT NOT NULL AUTO_INCREMENT,
    thread_id BIGINT NOT NULL,
    parent_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_forum_replies_thread (thread_id, created_at),
    KEY idx_forum_replies_parent (parent_id),
    KEY idx_forum_replies_user (user_id),
    CONSTRAINT fk_forum_replies_thread FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE,
    CONSTRAINT fk_forum_replies_parent FOREIGN KEY (parent_id) REFERENCES forum_replies (id) ON DELETE CASCADE,
    CONSTRAINT fk_forum_replies_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
