-- Runtime history bootstrap without Flyway.
-- Keep Russia (RU), remove Soviet Union / Russian Empire, and keep all history events empty.

DELETE FROM history_event;
DELETE FROM history_country WHERE country_code IN ('SU', 'RU_EMPIRE');

INSERT INTO history_country (country_code, name_zh, name_en, map_slot, marker_lon, marker_lat)
VALUES
  ('PT', '葡萄牙', 'Portugal', 'EUROPE', -8.2245, 39.3999),
  ('KR', '韩国', 'South Korea', 'ASIA_SOUTH', 127.7669, 35.9078),
  ('AH', '奥匈帝国', 'Austria-Hungary', 'EUROPE', 19.0402, 47.4979),
  ('ES', '西班牙', 'Spain', 'EUROPE', -3.7492, 40.4637),
  ('RU', '俄罗斯', 'Russia', 'ASIA_NORTH', 105.3188, 61.5240),
  ('JP', '日本', 'Japan', 'ASIA_SOUTH', 138.2529, 36.2048),
  ('DE', '德国', 'Germany', 'EUROPE', 10.4515, 51.1657),
  ('FR', '法国', 'France', 'EUROPE', 2.2137, 46.2276),
  ('GB', '英国', 'United Kingdom', 'EUROPE', -3.4360, 55.3781),
  ('US', '美国', 'United States', 'NA_NORTH', -95.7129, 37.0902)
ON DUPLICATE KEY UPDATE
  name_zh = VALUES(name_zh),
  name_en = VALUES(name_en),
  map_slot = VALUES(map_slot),
  marker_lon = VALUES(marker_lon),
  marker_lat = VALUES(marker_lat);

