-- 在连接 MySQL 服务器（不指定库）时执行一次，例如：
-- mysql -u root -p -e "source ..." 或 mysql -u root -p < create_database_mysql.sql
-- 建库后启动 Spring Boot，Flyway 会自动执行 db/migration 下的脚本（如 V20260328_*）。

CREATE DATABASE IF NOT EXISTS philosophy_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
