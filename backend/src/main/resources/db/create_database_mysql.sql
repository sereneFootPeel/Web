-- 在连接 MySQL 服务器（不指定库）时执行一次，例如：
-- mysql -u root -p -e "source ..." 或 mysql -u root -p < create_database_mysql.sql
-- 建库后启动 Spring Boot，应用会通过 schema-mysql.sql 与 db/init/history_runtime_seed.sql 初始化所需历史表与基础数据。

CREATE DATABASE IF NOT EXISTS philosophy_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
