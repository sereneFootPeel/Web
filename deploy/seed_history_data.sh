set -e

DB_NAME="${DB_NAME:-philosophy_db}"
DB_ROOT_USER="${DB_ROOT_USER:-root}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-Mmoonj10y?}"
PROJECT_ROOT="${PROJECT_ROOT:-/home/linuxuser/Web}"
BACKEND_DIR="$PROJECT_ROOT/backend"

cd "$BACKEND_DIR"

echo "[seed-history] ensure history tables exist"
mysql -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" "$DB_NAME" <<'SQL'
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
    CONSTRAINT pk_history_event PRIMARY KEY (id),
    CONSTRAINT fk_history_event_country
        FOREIGN KEY (country_id) REFERENCES history_country (id)
        ON DELETE CASCADE,
    KEY idx_history_event_country_year (country_id, start_year, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

echo "[seed-history] import runtime history seed SQL"
mysql -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" "$DB_NAME" < src/main/resources/db/init/history_runtime_seed.sql

echo "[seed-history] verify row counts"
country_count=$(mysql -N -B -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM history_country;")
event_count=$(mysql -N -B -u"$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" "$DB_NAME" -e "SELECT COUNT(*) FROM history_event;")

echo "[seed-history] history_country=$country_count"
echo "[seed-history] history_event=$event_count"

if [ "${country_count:-0}" -le 0 ]; then
  echo "[seed-history] ERROR: history country verification failed" >&2
  exit 1
fi

