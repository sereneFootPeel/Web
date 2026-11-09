-- 在连接 MySQL 服务器（不指定库）时执行一次，例如：
-- mysql -u root -p -e "source ..." 或 mysql -u root -p < create_database_mysql.sql
-- 建库后启动 Spring Boot。应用会通过 schema-mysql.sql 维护运行时表结构。

CREATE DATABASE IF NOT EXISTS philosophy_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
