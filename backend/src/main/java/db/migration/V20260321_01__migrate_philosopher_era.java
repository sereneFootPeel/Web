package db.migration;

import com.philosophy.util.DateUtils;
import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

public class V20260321_01__migrate_philosopher_era extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        if (!columnExists(connection, "philosophers", "era")) {
            return;
        }

        backfillBirthDeathFromEra(connection);

        int missingBirthYearCount = countMissingBirthYear(connection);
        if (missingBirthYearCount > 0) {
            throw new FlywayException("迁移终止：仍有 " + missingBirthYearCount + " 位哲学家缺少 birth_year，请先补齐后再删 era 列。");
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE philosophers DROP COLUMN era");
        }
    }

    private void backfillBirthDeathFromEra(Connection connection) throws Exception {
        String selectSql = """
                SELECT id, era, birth_year, death_year
                FROM philosophers
                WHERE era IS NOT NULL
                  AND TRIM(era) <> ''
                  AND (birth_year IS NULL OR death_year IS NULL)
                """;

        String updateSql = "UPDATE philosophers SET birth_year = ?, death_year = ? WHERE id = ?";

        try (PreparedStatement select = connection.prepareStatement(selectSql);
             ResultSet rs = select.executeQuery();
             PreparedStatement update = connection.prepareStatement(updateSql)) {
            while (rs.next()) {
                long id = rs.getLong("id");
                String era = rs.getString("era");
                Integer birthYear = getNullableInt(rs, "birth_year");
                Integer deathYear = getNullableInt(rs, "death_year");

                if (birthYear == null) {
                    birthYear = DateUtils.parseBirthDateFromRange(era);
                }
                if (deathYear == null) {
                    deathYear = DateUtils.parseDeathYearFromRange(era);
                }
                if (birthYear == null) {
                    continue;
                }

                update.setInt(1, birthYear);
                if (deathYear != null) {
                    update.setInt(2, deathYear);
                } else {
                    update.setNull(2, java.sql.Types.INTEGER);
                }
                update.setLong(3, id);
                update.executeUpdate();
            }
        }
    }

    private int countMissingBirthYear(Connection connection) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COUNT(*) FROM philosophers WHERE birth_year IS NULL");
             ResultSet rs = statement.executeQuery()) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private Integer getNullableInt(ResultSet rs, String column) throws Exception {
        int value = rs.getInt(column);
        if (rs.wasNull()) {
            return null;
        }
        return value;
    }

    private boolean columnExists(Connection connection, String tableName, String columnName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getColumns(connection.getCatalog(), null, tableName, columnName)) {
            if (rs.next()) {
                return true;
            }
        }
        try (ResultSet rs = metaData.getColumns(connection.getCatalog(), null, tableName.toUpperCase(), columnName.toUpperCase())) {
            return rs.next();
        }
    }
}
