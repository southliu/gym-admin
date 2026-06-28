# 课程预约模块设计文档

日期：2026-06-27

## 概述

为 gym-admin 后台管理系统开发课程预约模块，包含课程管理和在线预约两大功能。全部在后台管理系统内操作，管理员发布课程，管理员代替会员（从系统用户列表选择）进行预约。

## 技术栈

- 前端：React 19 + Ant Design + Zustand + TypeScript（south-admin-react）
- 后端：NestJS 10 + TypeORM + MySQL + JWT（south-admin-nest）
- 前后端均沿用项目现有架构模式

## 数据模型

### 实体关系

```
CourseType(课程类型)    Location(地点)
        \                  /
         Course(课程模板)
              |
        CourseSession(课次)
              |
         Booking(预约)  →  User(已有系统用户)
```

### CourseType（课程类型）

表名：`gym_course_type`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| name | varchar(50) | 类型名称，如"瑜伽"、"搏击操" |
| description | text, nullable | 描述 |
| order | int, default 0 | 排序 |
| 父类字段 | BaseEntity | id, createdAt, updatedAt, isDeleted, deletedAt |

### Location（地点）

表名：`gym_location`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| name | varchar(100) | 地点名称，如"1号操房" |
| address | varchar(255), nullable | 详细地址/描述 |
| capacity | int, nullable | 地点最大容量 |
| 父类字段 | BaseEntity | 同上 |

### Course（课程模板）

表名：`gym_course`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| name | varchar(100) | 课程名称 |
| typeId | bigint FK → gym_course_type.id | 课程类型 |
| locationId | bigint FK → gym_location.id | 上课地点 |
| instructor | varchar(50), nullable | 教练/讲师姓名 |
| description | text, nullable | 课程描述 |
| capacity | int | 单次课程最大预约人数 |
| status | int | 1=开放预约 2=已满 3=已取消 4=已结束 |
| isRecurring | boolean, default false | 是否周期课程 |
| repeatRule | json, nullable | 重复规则（见下方格式） |
| startDate | datetime | 课程开始日期/时间 |
| createdUser | varchar(50) | 创建人 |
| updatedUser | varchar(50) | 更新人 |
| 父类字段 | BaseEntity | 同上 |

### CourseSession（课次）

表名：`gym_course_session`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| courseId | bigint FK → gym_course.id | 所属课程 |
| sessionDate | date | 上课日期 |
| startTime | time | 开始时间 |
| endTime | time | 结束时间 |
| capacity | int | 本次最大预约人数（继承自课程，可单独调整） |
| bookedCount | int, default 0 | 已预约人数（冗余字段） |
| status | int | 1=开放 2=已满 3=已取消 4=已结束 |
| 父类字段 | BaseEntity | 同上 |

### Booking（预约）

表名：`gym_booking`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| sessionId | bigint FK → gym_course_session.id | 预约的课次 |
| userId | bigint FK → sys_user.id | 预约用户 |
| status | int | 1=已预约 2=已取消 3=已完成 |
| remark | varchar(255), nullable | 备注 |
| 父类字段 | BaseEntity | 同上 |

唯一约束：`(sessionId, userId)` — 同一用户不能重复预约同一课次

### 重复规则（repeatRule）JSON 格式

```json
{
  "freq": "weekly",
  "days": [1, 3, 5],
  "interval": 1,
  "endDate": "2024-03-01"
}
```

- `freq`：重复频率，目前仅支持 `weekly`
- `days`：星期几（1=周一 ~ 7=周日）
- `interval`：间隔（每隔几周）
- `endDate`：重复结束日期

## API 设计

遵循项目现有路由风格：`/page`、`/list`、`/detail`、`/create`、`/update/:id`、`/:id` DELETE。

### CourseType API（`/gym/course-type`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 name 筛选 |
| GET | `/list` | 全部列表（下拉选择用） |
| GET | `/detail?id=` | 详情 |
| POST | `/create` | 创建 |
| PUT | `/update/:id` | 更新 |
| DELETE | `/:id` | 软删除 |

### Location API（`/gym/location`）

同 CourseType，字段不同（name, address, capacity）。

### Course API（`/gym/course`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 name/typeId/status 筛选 |
| GET | `/detail?id=` | 详情（含统计：总预约数、各课次情况） |
| POST | `/create` | 创建课程（单次课程生成 1 个 session，周期课程批量生成 sessions） |
| PUT | `/update/:id` | 更新课程基本信息（不影响已有 session） |
| DELETE | `/:id` | 软删除（同时取消未完成的预约） |
| PUT | `/updateStatus/:id` | 更新课程状态（开放/取消/结束） |
| GET | `/stats` | 列表统计摘要（总课程数、总预约数、热门课程 Top 5） |

### Session API（`/gym/session`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 courseId/sessionDate/status 筛选 |
| GET | `/detail?id=` | 详情（含已预约用户列表） |
| PUT | `/updateStatus/:id` | 更新课次状态 |
| PUT | `/:id` | 调整个别课次的时间/容量 |

### Booking API（`/gym/booking`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 userId/sessionId/status 筛选 |
| POST | `/create` | 创建预约（含冲突检测 + 容量检查） |
| PUT | `/cancel/:id` | 取消预约 |
| DELETE | `/:id` | 软删除预约记录 |

## 关键业务逻辑

### 预约冲突检测（POST /gym/booking/create）

1. 检查课次是否存在且状态为"开放"
2. 检查 `(sessionId, userId)` 是否已有有效预约 → 如有则返回 ConflictException
3. 检查 `bookedCount < capacity` → 如已满则返回 BadRequestException
4. 通过后：创建预约 + `bookedCount++` + 如已满则更新课次状态为"已满"

### 取消预约（PUT /gym/booking/cancel/:id）

1. 检查预约是否存在且状态为"已预约"
2. 取消预约 + `bookedCount--`
3. 如课次之前状态为"已满"，恢复为"开放"

### 周期课程创建（POST /gym/course/create）

1. 根据 `repeatRule` 计算所有课次日期
2. 为每个日期生成一个 CourseSession 记录
3. 如规则不合法（如无匹配日期）则返回 BadRequestException

## 前端页面设计

### 菜单结构

```
课程管理 (gym/)
├── 课程类型 (gym/course-type)   → 分页列表 + Modal 新增/编辑
├── 课程地点 (gym/location)      → 分页列表 + Modal 新增/编辑
├── 课程管理 (gym/course)        → 分页列表 + Modal 新增/编辑 + 课次管理 Drawer
└── 预约管理 (gym/booking)       → 分页列表 + 取消操作
```

### 页面1：课程类型管理（`src/pages/gym/course-type/index.tsx`）

标准 CRUD 列表页，与现有 `system/log` 模式一致：
- 搜索：类型名称（Input）
- 表格列：ID、类型名称、描述、排序、创建时间、操作（编辑/删除）
- 新增/编辑：Modal + BaseForm（名称、描述、排序）

### 页面2：课程地点管理（`src/pages/gym/location/index.tsx`）

标准 CRUD 列表页：
- 搜索：地点名称（Input）
- 表格列：ID、地点名称、详细地址、最大容量、创建时间、操作（编辑/删除）
- 新增/编辑：Modal + BaseForm（名称、地址、容量）

### 页面3：课程管理（`src/pages/gym/course/index.tsx`）

较复杂的 CRUD 列表页：
- 搜索：课程名称（Input）、课程类型（ApiSelect）、状态（Select）
- 表格列：ID、课程名称、类型、地点、教练、状态（Tag 颜色区分）、是否周期、总课次数、已预约总数、操作（查看课次/编辑/删除）
- 新增/编辑 Modal：
  - 基础信息：名称、类型（ApiSelect）、地点（ApiSelect）、教练、描述、容量
  - 时间安排：开始日期（DatePicker）、是否周期（Switch）
  - 周期设置（仅 isRecurring=true 时显示）：重复频率（weekly）、重复日（Checkbox: 周一~周日）、结束日期（DatePicker）
- 课次管理 Drawer：点击"查看课次"打开，展示该课程下的所有课次列表

### 页面4：预约管理（`src/pages/gym/booking/index.tsx`）

标准 CRUD 列表页：
- 搜索：用户姓名（Input）、课程名称（ApiSelect）、状态（Select）
- 表格列：ID、用户姓名、课程名称、课次日期、上课时间、地点、状态（Tag）、预约时间、操作（取消预约/删除）
- 新增预约 Modal：
  - 选择课程（ApiSelect，仅显示"开放预约"状态的课程）
  - 选择课次（ApiSelect，联动课程，仅显示"开放"状态的课次）
  - 选择用户（ApiSelect，从 `/system/user/list` 获取）
  - 备注（TextArea）

## 权限设计

沿用现有权限前缀模式，每个页面 4 个权限点：

```
/gym/course-type          → page, create, update, delete
/gym/location             → page, create, update, delete
/gym/course               → page, create, update, delete
/gym/booking              → page, create, update(取消), delete
```

## 后端模块结构

```
src/gym/
├── gym.module.ts
├── entities/
│   ├── course-type.entity.ts
│   ├── location.entity.ts
│   ├── course.entity.ts
│   ├── course-session.entity.ts
│   └── booking.entity.ts
├── dto/
│   ├── course-type.dto.ts
│   ├── location.dto.ts
│   ├── course.dto.ts
│   ├── session.dto.ts
│   └── booking.dto.ts
├── course-type/
│   ├── course-type.module.ts
│   ├── course-type.controller.ts
│   └── course-type.service.ts
├── location/
│   ├── location.module.ts
│   ├── location.controller.ts
│   └── location.service.ts
├── course/
│   ├── course.module.ts
│   ├── course.controller.ts
│   └── course.service.ts
├── session/
│   ├── session.module.ts
│   ├── session.controller.ts
│   └── session.service.ts
└── booking/
    ├── booking.module.ts
    ├── booking.controller.ts
    └── booking.service.ts
```

## 错误处理

沿用项目现有模式：
- 业务异常用 NestJS 内置异常类（NotFoundException、BadRequestException、ConflictException）
- 由全局 HttpExceptionFilter 捕获并记录到日志表
- 响应拦截器自动包装为 `{ code, message, data, timestamp }` 格式

### 关键异常场景

| 场景 | 异常类型 | 消息 |
|------|----------|------|
| 预约已存在 | ConflictException | "您已预约该课次" |
| 课次已满 | BadRequestException | "该课次预约已满" |
| 课次状态不可预约 | BadRequestException | "该课次当前不可预约" |
| 周期规则无匹配日期 | BadRequestException | "重复规则未匹配到任何日期" |
| 删除有关联预约的课次 | BadRequestException | "该课次存在预约记录，无法删除" |
