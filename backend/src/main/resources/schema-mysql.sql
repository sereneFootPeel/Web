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
