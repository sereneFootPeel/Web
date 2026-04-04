# Backend maintenance notes

## Flyway migration rule

不要删除、重命名、覆盖已经提交过的 Flyway 版本迁移脚本，尤其是 `backend/src/main/resources/db/migration/` 里的 `V...__*.sql` / `V...__*.java` 文件。

原因：

- Flyway 会校验 **版本号 + 描述 + checksum**。
- 脚本一旦在任意环境执行过，再删掉或改名，后续启动就会出现 `Validate failed`。
- 新环境建库时，也需要这些旧脚本从头重放；如果删掉，新的数据库将无法完整初始化。

正确做法：

1. 旧迁移保持不动。
2. 需要修复数据或结构时，新建一个更高版本的迁移。
3. 如果历史上已经误改过脚本，先恢复正确文件；恢复不了时，只在受影响环境执行一次 `repair`，然后继续保持脚本不可变。

## One-time repair for an already-drifted local database

如果本地已经遇到类似下面的错误：

- `Validate failed: Migrations have failed validation`
- `Detected failed migration to version ...`
- `Migration checksum mismatch ...`

可以在 `backend` 目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-flyway.ps1
```

如果 `8080` 已被占用，脚本默认使用 `8081`，也可以手动指定：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\repair-flyway.ps1 -Port 8091
```

这个脚本只会在这一次启动命令里附带 `--app.flyway.repair-before-migrate=true`，不会把 repair 常开。

## Why this repo keeps SQL migrations

`db/migration` 下的 SQL 不是“临时脚本”，而是项目数据库历史的一部分，应该跟代码一起保留在 Git 里。

唯一可以按需本地删除的是你自己生成的临时导出文件、一次性草稿文件，**不是** 已经纳入 Flyway 管理的版本迁移。

