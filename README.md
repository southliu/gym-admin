# Gym Admin - 健身房后台管理系统

一套基于 React + NestJS 的全栈后台管理系统，包含前端和后端两个独立项目。

## 项目结构

```
gym-admin/
├── south-admin-react/   # 前端项目（React + Vite + Ant Design）
├── south-admin-nest/    # 后端项目（NestJS + TypeORM + MySQL）
└── README.md
```

## 技术栈

### 前端 (`south-admin-react`)

| 分类 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript 5.9 |
| 构建工具 | Vite 7.3 |
| UI 组件库 | Ant Design 6 |
| 状态管理 | Zustand 5 |
| 路由 | React Router DOM 7（HashRouter，文件系统自动生成路由） |
| 样式 | UnoCSS + Less |
| 图表 | ECharts 6 |
| 国际化 | react-i18next |
| HTTP 客户端 | Axios |
| 代码规范 | ESLint + Prettier + Husky + Commitlint |

前端采用 **pnpm monorepo** 结构，公共包位于 `packages/` 目录：

| 包名 | 说明 |
|------|------|
| `@south/request` | Axios 请求封装 |
| `@south/message` | 全局消息/通知组件 |
| `@south/utils` | 通用工具函数 |
| `@south/stylelint` | Stylelint 共享配置 |

### 后端 (`south-admin-nest`)

| 分类 | 技术 |
|------|------|
| 框架 | NestJS 10 + TypeScript 5.1 |
| ORM | TypeORM 0.3 |
| 数据库 | MySQL（mysql2 驱动） |
| 认证 | Passport.js + JWT |
| 密码加密 | bcrypt |
| 参数校验 | class-validator + class-transformer |
| 配置管理 | @nestjs/config |
| 测试 | Jest + Supertest |

## 功能模块

### 系统管理

- **用户管理** - 用户的增删改查、分页查询、密码更新、权限刷新
- **角色管理** - 角色的增删改查、菜单授权
- **菜单管理** - 菜单树形结构管理（目录/菜单/按钮三级类型），支持中英文标签、图标选择、可见性控制
- **权限管理** - 权限的增删改查

### 内容管理

- **文章管理** - 文章的创建、编辑、发布/草稿状态切换，支持富文本编辑器（WangEditor）

### 仪表盘

- 数据概览，包含柱状图、折线图等可视化图表

### 系统日志

- 全局请求日志自动记录（请求方法、URL、参数、耗时、状态码、错误信息）

## 数据库设计

系统包含 6 张核心表：

| 表名 | 说明 |
|------|------|
| `sys_user` | 用户表 |
| `sys_role` | 角色表 |
| `sys_menu` | 菜单表（自关联父子结构） |
| `sys_permission` | 权限表 |
| `content_article` | 文章表 |
| `sys_log` | 操作日志表 |

关联关系：用户 <-> 角色（多对多），角色 <-> 菜单（多对多），菜单 -> 权限（多对一）。

## 权限模型

采用 **RBAC（基于角色的访问控制）** 模型：

1. 用户登录获取 JWT Token
2. 前端通过 Token 请求用户信息和菜单列表
3. 菜单的 `rule` 字段控制按钮级别的细粒度权限
4. 后端通过 `JwtAuthGuard` 全局守卫校验每个请求

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- MySQL >= 5.7

### 1. 启动后端

```bash
# 进入后端目录
cd south-admin-nest

# 安装依赖
pnpm install

# 配置数据库连接（编辑 .env 文件）
# DB_HOST=localhost
# DB_PORT=3306
# DB_USERNAME=root
# DB_PASSWORD=your_password
# DB_DATABASE=south_admin
# JWT_SECRET=your_jwt_secret
# PORT=8000

# 初始化数据库和基础数据
pnpm db:init

# 启动开发服务器
pnpm start:dev
```

后端服务默认运行在 `http://127.0.0.1:8000`。

### 2. 启动前端

```bash
# 进入前端目录
cd south-admin-react

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端开发服务器默认运行在 `http://localhost:7000`，API 请求通过 Vite 代理转发到后端 `http://127.0.0.1:8000`。

### 3. 访问系统

浏览器打开 `http://localhost:7000`，使用初始化数据中的账号登录即可。

## 常用命令

### 前端

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm build:test` | 构建测试版本 |
| `pnpm lint` | ESLint 检查 |
| `pnpm lint:fix` | ESLint 自动修复 |
| `pnpm prettier` | 代码格式化 |
| `pnpm commit` | 规范化提交（Commitlint） |

### 后端

| 命令 | 说明 |
|------|------|
| `pnpm start:dev` | 启动开发服务器（热重载） |
| `pnpm build` | 构建生产版本 |
| `pnpm start:prod` | 启动生产服务器 |
| `pnpm db:init` | 初始化数据库和基础数据 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行端到端测试 |
| `pnpm lint` | ESLint 检查 |

## 环境配置

### 前端环境变量

| 文件 | 说明 |
|------|------|
| `.env` | 基础配置（加密密钥等） |
| `.env.development` | 开发环境（端口 7000，代理到后端 8000） |
| `.env.production` | 生产环境（Mock API） |
| `.env.test` | 测试环境 |

### 后端环境变量

编辑 `south-admin-nest/.env`：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=south_admin

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# 服务端口
PORT=8000
```

## License

[MIT](./south-admin-react/LICENSE)
