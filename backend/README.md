# Backend maintenance notes

## Runtime SQL initialization

当前后端**不使用 Flyway**。

启动时执行 `backend/src/main/resources/schema-mysql.sql`：

- 删除已下线的历史表、测试结果表，以及内容和流派上的历史字段
- 补齐哲学家图片字段

## Safe cleanup

通常可安全删除的本地产物：

- `backend/target/`
- `server/target/`
- `frontend/dist/`
- 根目录 `target/`

这些都是构建生成物，不是源码。
