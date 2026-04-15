# Backend maintenance notes

## Runtime SQL initialization

当前后端**不使用 Flyway**。

历史模块通过下面两个文件在启动时初始化：

- `backend/src/main/resources/schema-mysql.sql`：建表
- `backend/src/main/resources/db/init/history_runtime_seed.sql`：写入保留的历史国家，并清空 `history_event`

当前运行策略：

1. 保留 `RU`（俄罗斯）
2. 删除 `SU`（苏联）与 `RU_EMPIRE`（俄罗斯帝国）
3. `history_event` 始终清空

## Deployment seeding

部署脚本 `deploy/seed_history_data.sh` 会显式执行同一套 runtime SQL。

如果需要调整历史国家初始化内容，请直接修改：

`backend/src/main/resources/db/init/history_runtime_seed.sql`

而不是再新增 Flyway migration。

## Safe cleanup

通常可安全删除的本地产物：

- `backend/target/`
- `server/target/`
- `frontend/dist/`
- 根目录 `target/`

这些都是构建生成物，不是源码。

