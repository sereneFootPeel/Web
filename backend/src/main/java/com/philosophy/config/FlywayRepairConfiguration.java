package com.philosophy.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 迁移脚本内容被修改后，已执行过的版本会出现 checksum mismatch。
 * 将 {@code app.flyway.repair-before-migrate=true} 启动一次，会按磁盘上的脚本更新
 * {@code flyway_schema_history} 中的校验和，然后再 migrate；用完后改回 false。
 */
@Configuration
@ConditionalOnProperty(name = "app.flyway.repair-before-migrate", havingValue = "true")
public class FlywayRepairConfiguration {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
