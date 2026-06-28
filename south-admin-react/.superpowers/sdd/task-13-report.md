# Task 13: Menu & Permission Seed Data

## Status: DONE

## Commit

```
5cd610a feat: add gym module menu and permission seed data
```

## What Was Added

### Permissions (17 entries)

1 module-level permission:
- `/gym/course` — course management module

16 CRUD permissions (4 per sub-menu):
- `/gym/course-type/{view,create,update,delete}`
- `/gym/course-location/{view,create,update,delete}`
- `/gym/course/{view,create,update,delete}`
- `/gym/booking/{view,create,update,delete}`

### Menu Entries (21 entries)

| Label | Type | Router | Parent |
|-------|------|--------|--------|
| 课程管理 | 1 (directory) | `/gym` | NULL (top-level) |
| 课程类型 | 2 (menu) | `/gym/course-type` | 课程管理 (dir) |
| 课程地点 | 2 (menu) | `/gym/course-location` | 课程管理 (dir) |
| 课程管理 | 2 (menu) | `/gym/course` | 课程管理 (dir) |
| 预约管理 | 2 (menu) | `/gym/booking` | 课程管理 (dir) |
| 查看课程类型 | 3 (button) | NULL | 课程类型 |
| 创建课程类型 | 3 (button) | NULL | 课程类型 |
| 修改课程类型 | 3 (button) | NULL | 课程类型 |
| 删除课程类型 | 3 (button) | NULL | 课程类型 |
| 查看课程地点 | 3 (button) | NULL | 课程地点 |
| 创建课程地点 | 3 (button) | NULL | 课程地点 |
| 修改课程地点 | 3 (button) | NULL | 课程地点 |
| 删除课程地点 | 3 (button) | NULL | 课程地点 |
| 查看课程 | 3 (button) | NULL | 课程管理 (menu) |
| 创建课程 | 3 (button) | NULL | 课程管理 (menu) |
| 修改课程 | 3 (button) | NULL | 课程管理 (menu |
| 删除课程 | 3 (button) | NULL | 课程管理 (menu) |
| 查看预约 | 3 (button) | NULL | 预约管理 |
| 创建预约 | 3 (button) | NULL | 预约管理 |
| 修改预约 | 3 (button) | NULL | 预约管理 |
| 删除预约 | 3 (button) | NULL | 预约管理 |

### Role-Menu Associations

All 21 gym menu entries assigned to the admin role (系统管理员). Disambiguated the two "课程管理" entries using `AND type = 1` and `AND type = 2` in the SELECT subquery.

## Notes

- Permission name convention: `/gym/{entity}/{action}` follows existing `/authority/{entity}/{action}` pattern
- Directory menu uses `mdi:dumbbell` icon for the gym module
- Menu order: 5 (after 内容管理 at order 4)
- Sub-menu and button orders are sequential from 0
- Section numbering in init.sql updated: old sections 14-15 renumbered to 21-22; new sections 14-20 added
