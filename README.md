# 哲学站 前后端分离

React + Spring Boot 前后端分离架构。

## 项目结构

- **frontend/** - React (Vite) 前端，对应 philosophy-frontend
- **philosophy-backend/** - Spring Boot 后端 API

## 快速启动

### 1. 后端

```bash
cd philosophy-backend
mvn spring-boot:run
```

后端默认端口 **8080**，需配置 MySQL 数据库 `philosophy_db`（与 Philosophy Website 共用）。

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器端口 **5173**，自动代理 `/api` 到 `http://localhost:8080`。

### 3. 访问

打开 http://localhost:5173

## 环境变量

- **DB_PASSWORD** - 数据库密码（可选，默认见 application.properties）
- **MAIL_USER** / **MAIL_PASSWORD** - 邮件配置（可选）

## 已实现功能

### M1 可演示
- 首页（几何动画 + 欢迎入口）
- 名句推荐（随机名句、换一批）
- 哲学家（列表、详情、代表思想）
- 流派（树形导航、详情）
- 搜索（关键词搜索哲学家/流派/内容）

### M2 可试用
- 登录 / 注册 / 退出（邮箱验证码注册）
- 用户中心（个人资料、内容、评论数）
- 前端路由守卫（登录态、管理员）

### M3 可上线
- 后台管理入口（管理员仪表盘、用户/哲学家/流派/内容统计）
