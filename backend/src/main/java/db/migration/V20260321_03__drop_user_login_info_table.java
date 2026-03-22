package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

public class V20260321_03__drop_user_login_info_table extends BaseJavaMigration {

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        if (!tableExists(connection, "user_login_info")) {
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.execute("DROP TABLE user_login_info");
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getTables(connection.getCatalog(), null, tableName, null)) {
            if (rs.next()) {
                return true;
            }
        }
        try (ResultSet rs = metaData.getTables(connection.getCatalog(), null, tableName.toUpperCase(), null)) {
            return rs.next();
        }
    }
}
