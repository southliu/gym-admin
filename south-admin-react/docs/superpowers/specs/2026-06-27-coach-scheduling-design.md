# 教练排班模块设计文档

日期：2026-06-27

## 概述

为 gym-admin 后台管理系统开发教练排班模块，包含教练信息管理、排班调度、课程分配和工作统计功能。基于已完成的课程预约模块，将课程表的 `instructor` 文本字段替换为 `coachId` 外键关联教练实体。

## 技术栈

- 前端：React 19 + Ant Design + Zustand + TypeScript（south-admin-react）
- 后端：NestJS 10 + TypeORM + MySQL + JWT（south-admin-nest）
- 前后端均沿用项目现有架构模式

## 数据模型

### 实体关系

```
Coach(教练)
   ├── CoachScheduleTemplate(周模板)
   ├── CoachScheduleOverride(覆盖/调整)
   └── CoachCourse(教练-课程关联) → Course
```

### Coach（教练）

表名：`gym_coach`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| name | varchar(50) | 姓名 |
| phone | varchar(20), nullable | 联系电话 |
| gender | int, nullable | 1=男 2=女 |
| specialties | varchar(255), nullable | 专长（如"瑜伽、普拉提"） |
| qualifications | text, nullable | 资质证书 |
| avatar | varchar(255), nullable | 头像URL |
| status | int, default 1 | 1=在职 2=离职 |
| 父类字段 | BaseEntity | id, createdAt, updatedAt, isDeleted, deletedAt |

### CoachScheduleTemplate（排班模板）

表名：`gym_coach_schedule_template`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| coachId | bigint FK → gym_coach.id | 教练 |
| dayOfWeek | int | 星期几（1=周一 ~ 7=周日） |
| startTime | time | 开始时间 |
| endTime | time | 结束时间 |
| 父类字段 | BaseEntity | 同上 |

### CoachScheduleOverride（排班覆盖）

表名：`gym_coach_schedule_override`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| coachId | bigint FK → gym_coach.id | 教练 |
| overrideDate | date | 覆盖日期 |
| type | int | 1=请假(取消) 2=加班(新增) 3=换班(修改时间) |
| startTime | time, nullable | 新开始时间（type=2/3时） |
| endTime | time, nullable | 新结束时间（type=2/3时） |
| reason | varchar(255), nullable | 原因 |
| 父类字段 | BaseEntity | 同上 |

### CoachCourse（教练-课程关联）

表名：`gym_coach_course`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 |
| coachId | bigint FK → gym_coach.id | 教练 |
| courseId | bigint FK → gym_course.id | 课程 |
| 父类字段 | BaseEntity | 同上 |

唯一约束：`(coachId, courseId)`

### Course 实体变更

将 `instructor` 字段替换为 `coachId`：

```diff
- @Column({ length: 50, nullable: true })
- instructor: string;
+ @Column({ type: 'bigint', nullable: true })
+ coachId: number;
```

## API 设计

遵循项目现有路由风格：`/page`、`/list`、`/detail?id=`、`/create`、`/update/:id`、`/:id` DELETE。

### Coach API（`/gym/coach`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 name/status/specialties 筛选 |
| GET | `/list` | 全部列表（下拉选择用） |
| GET | `/detail?id=` | 详情（含排班模板、关联课程、统计） |
| POST | `/create` | 创建教练 |
| PUT | `/update/:id` | 更新教练信息 |
| DELETE | `/:id` | 软删除 |

### CoachScheduleTemplate API（`/gym/coach-schedule-template`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 coachId/dayOfWeek 筛选 |
| POST | `/create` | 创建模板条目 |
| PUT | `/update/:id` | 更新模板条目 |
| DELETE | `/:id` | 删除模板条目 |
| POST | `/batchGenerate` | 根据模板批量生成指定日期范围内的排班记录 |

### CoachScheduleOverride API（`/gym/coach-schedule-override`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 coachId/overrideDate/type 筛选 |
| POST | `/create` | 创建覆盖记录 |
| PUT | `/update/:id` | 更新覆盖记录 |
| DELETE | `/:id` | 删除覆盖记录 |

### CoachCourse API（`/gym/coach-course`）

| 方法 | 路由 | 说明 |
|------|------|------|
| GET | `/page` | 分页列表，支持 coachId/courseId 筛选 |
| POST | `/create` | 分配教练到课程 |
| DELETE | `/:id` | 取消分配 |

## 关键业务逻辑

### 模板生成排班（POST /gym/coach-schedule-template/batchGenerate）

1. 接收参数：`coachId`、`startDate`、`endDate`
2. 查询该教练的所有模板条目
3. 遍历日期范围，匹配 dayOfWeek 生成排班记录
4. 跳过已有 Override（type=1 请假）的日期
5. 批量插入生成的排班记录

### 排班查询（某日排班）

- GET `/gym/coach-schedule-template/page?coachId=1&date=2026-07-01`
- 返回该日的排班信息（模板 + Override 合并后的结果）

## 前端页面设计

### 菜单结构

```
教练管理 (gym/)
├── 教练管理 (gym/coach)                    → 分页列表 + Modal 新增/编辑 + 排班 Drawer
├── 排班模板 (gym/coach-schedule-template)  → 分页列表 + Modal 新增/编辑
├── 排班调整 (gym/coach-schedule-override)  → 分页列表 + Modal 新增/编辑
└── 教练课程 (gym/coach-course)             → 分页列表 + Modal 分配/取消
```

### 页面1：教练管理（`src/pages/gym/coach/index.tsx`）

标准 CRUD 列表页：
- 搜索：姓名（Input）、状态（Select: 在职/离职）
- 表格列：ID、姓名、电话、性别、专长、资质、状态（Tag）、关联课程数、排班天数、操作（查看排班/编辑/删除）
- 新增/编辑 Modal：姓名、电话、性别（Radio）、专长（Input）、资质（TextArea）、状态
- 排班管理 Drawer：点击"查看排班"打开，展示该教练的周模板列表，支持增删改模板条目

### 页面2：排班模板（`src/pages/gym/coach-schedule-template/index.tsx`）

标准 CRUD 列表页：
- 搜索：教练（ApiSelect）、星期（Select: 周一~周日）
- 表格列：ID、教练姓名、星期、开始时间、结束时间、操作（编辑/删除）
- 新增/编辑 Modal：教练（ApiSelect）、星期（Select）、开始时间（TimePicker）、结束时间（TimePicker）
- 批量生成按钮：选择日期范围，一键生成排班记录

### 页面3：排班调整（`src/pages/gym/coach-schedule-override/index.tsx`）

标准 CRUD 列表页：
- 搜索：教练（ApiSelect）、日期范围（RangePicker）、类型（Select: 请假/加班/换班）
- 表格列：ID、教练姓名、日期、类型（Tag）、开始时间、结束时间、原因、操作（编辑/删除）
- 新增/编辑 Modal：教练（ApiSelect）、日期（DatePicker）、类型（Select）、时间（TimePicker，仅加班/换班显示）、原因（TextArea）

### 页面4：教练课程（`src/pages/gym/coach-course/index.tsx`）

标准 CRUD 列表页：
- 搜索：教练（ApiSelect）、课程（ApiSelect）
- 表格列：ID、教练姓名、课程名称、分配时间、操作（删除）
- 新增 Modal：教练（ApiSelect）、课程（ApiSelect，仅显示开放状态的课程）

## 权限设计

沿用现有权限前缀模式：

```
/gym/coach                      → page, create, update, delete
/gym/coach-schedule-template    → page, create, update, delete
/gym/coach-schedule-override    → page, create, update, delete
/gym/coach-course               → page, create, delete
```

## 后端模块结构

```
src/gym/
├── entities/
│   ├── coach.entity.ts              (新增)
│   ├── coach-schedule-template.entity.ts  (新增)
│   ├── coach-schedule-override.entity.ts  (新增)
│   ├── coach-course.entity.ts       (新增)
│   └── course.entity.ts             (修改: instructor → coachId)
├── dto/
│   ├── coach.dto.ts                 (新增)
│   ├── coach-schedule-template.dto.ts  (新增)
│   ├── coach-schedule-override.dto.ts  (新增)
│   └── coach-course.dto.ts          (新增)
├── coach/
│   ├── coach.module.ts
│   ├── coach.controller.ts
│   └── coach.service.ts
├── coach-schedule-template/
│   ├── coach-schedule-template.module.ts
│   ├── coach-schedule-template.controller.ts
│   └── coach-schedule-template.service.ts
├── coach-schedule-override/
│   ├── coach-schedule-override.module.ts
│   ├── coach-schedule-override.controller.ts
│   └── coach-schedule-override.service.ts
├── coach-course/
│   ├── coach-course.module.ts
│   ├── coach-course.controller.ts
│   └── coach-course.service.ts
└── gym.module.ts (更新: 导入新子模块)
```

## 错误处理

沿用项目现有模式：

| 场景 | 异常类型 | 消息 |
|------|----------|------|
| 教练已关联课程 | BadRequestException | "该教练已关联此课程" |
| 模板时间冲突 | BadRequestException | "该时段已有排班模板" |
| 请假日期已有排班 | ConflictException | "该日期已有排班记录" |
| 批量生成无模板 | BadRequestException | "该教练没有排班模板" |

## Course 实体迁移

修改 `course.entity.ts`：
- 移除 `instructor` 字段
- 新增 `coachId` 字段（nullable bigint FK）
- 由于 `synchronize: true`，TypeORM 会自动处理列变更（nullable 新字段不丢数据）
