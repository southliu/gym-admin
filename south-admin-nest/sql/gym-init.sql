-- =============================================
-- 健身房管理系统 - 菜单、权限、角色初始化数据
-- 基于论文"基于web的健身房管理系统"的菜单结构
-- 参考: 2026-07-17 21_49-刘南方论文初稿
-- =============================================

START TRANSACTION;

SET FOREIGN_KEY_CHECKS = 0;

-- 删除已有的健身房菜单数据（避免重复插入）
-- 使用嵌套子查询别名绕过 MySQL "can't specify target table for update in FROM clause" 限制
DELETE FROM `sys_role_menu` WHERE menu_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_menu` WHERE router LIKE '/gym%') AS tmp
);
DELETE FROM `sys_menu` WHERE permission_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_permission` WHERE name LIKE '/gym%') AS tmp
);
DELETE FROM `sys_menu` WHERE router LIKE '/gym%';
DELETE FROM `sys_permission` WHERE name LIKE '/gym%';

-- 删除已有的健身房管理员角色（避免重复）
-- 注意: coach/member 角色由 SeedService 管理，此处不删除
DELETE FROM `sys_user_role` WHERE role_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_role` WHERE name = 'gym_admin') AS tmp
);
DELETE FROM `sys_role_menu` WHERE role_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_role` WHERE name = 'gym_admin') AS tmp
);
DELETE FROM `sys_role` WHERE name = 'gym_admin';

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- 1. 插入权限数据 (sys_permission)
-- =============================================

-- 健身房管理（顶级目录权限）
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym', '健身房管理', NOW(), NOW(), 0);

-- 课程类型 (course-type)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/course-type', '课程类型管理', NOW(), NOW(), 0),
('/gym/course-type/index', '课程类型列表', NOW(), NOW(), 0),
('/gym/course-type/create', '创建课程类型', NOW(), NOW(), 0),
('/gym/course-type/update', '修改课程类型', NOW(), NOW(), 0),
('/gym/course-type/view', '查看课程类型', NOW(), NOW(), 0),
('/gym/course-type/delete', '删除课程类型', NOW(), NOW(), 0);

-- 场地管理 (location)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/location', '场地管理', NOW(), NOW(), 0),
('/gym/location/index', '场地列表', NOW(), NOW(), 0),
('/gym/location/create', '创建场地', NOW(), NOW(), 0),
('/gym/location/update', '修改场地', NOW(), NOW(), 0),
('/gym/location/view', '查看场地', NOW(), NOW(), 0),
('/gym/location/delete', '删除场地', NOW(), NOW(), 0);

-- 课程管理 (course)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/course', '课程管理', NOW(), NOW(), 0),
('/gym/course/index', '课程列表', NOW(), NOW(), 0),
('/gym/course/create', '创建课程', NOW(), NOW(), 0),
('/gym/course/update', '修改课程', NOW(), NOW(), 0),
('/gym/course/view', '查看课程', NOW(), NOW(), 0),
('/gym/course/delete', '删除课程', NOW(), NOW(), 0),
('/gym/course/session', '查看课次', NOW(), NOW(), 0);

-- 预约管理 (booking)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/booking', '预约管理', NOW(), NOW(), 0),
('/gym/booking/index', '预约列表', NOW(), NOW(), 0),
('/gym/booking/create', '创建预约', NOW(), NOW(), 0),
('/gym/booking/view', '查看预约', NOW(), NOW(), 0),
('/gym/booking/delete', '删除预约', NOW(), NOW(), 0);

-- 教练管理 (coach)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/coach', '教练管理', NOW(), NOW(), 0),
('/gym/coach/index', '教练列表', NOW(), NOW(), 0),
('/gym/coach/create', '创建教练', NOW(), NOW(), 0),
('/gym/coach/update', '修改教练', NOW(), NOW(), 0),
('/gym/coach/view', '查看教练', NOW(), NOW(), 0),
('/gym/coach/delete', '删除教练', NOW(), NOW(), 0),
('/gym/coach/schedule', '查看教练排班', NOW(), NOW(), 0);

-- 排班模板 (coach-schedule-template)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/coach-schedule-template', '排班模板管理', NOW(), NOW(), 0),
('/gym/coach-schedule-template/index', '排班模板列表', NOW(), NOW(), 0),
('/gym/coach-schedule-template/create', '创建排班模板', NOW(), NOW(), 0),
('/gym/coach-schedule-template/update', '修改排班模板', NOW(), NOW(), 0),
('/gym/coach-schedule-template/view', '查看排班模板', NOW(), NOW(), 0),
('/gym/coach-schedule-template/delete', '删除排班模板', NOW(), NOW(), 0),
('/gym/coach-schedule-template/batchGenerate', '批量生成排班', NOW(), NOW(), 0);

-- 排班调班 (coach-schedule-override)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/coach-schedule-override', '排班调班管理', NOW(), NOW(), 0),
('/gym/coach-schedule-override/index', '排班调班列表', NOW(), NOW(), 0),
('/gym/coach-schedule-override/create', '创建排班调班', NOW(), NOW(), 0),
('/gym/coach-schedule-override/update', '修改排班调班', NOW(), NOW(), 0),
('/gym/coach-schedule-override/view', '查看排班调班', NOW(), NOW(), 0),
('/gym/coach-schedule-override/delete', '删除排班调班', NOW(), NOW(), 0);

-- 教练课程 (coach-course)
INSERT INTO `sys_permission` (name, description, create_at, update_at, is_deleted) VALUES
('/gym/coach-course', '教练课程管理', NOW(), NOW(), 0),
('/gym/coach-course/index', '教练课程列表', NOW(), NOW(), 0),
('/gym/coach-course/create', '创建教练课程', NOW(), NOW(), 0),
('/gym/coach-course/view', '查看教练课程', NOW(), NOW(), 0),
('/gym/coach-course/delete', '删除教练课程', NOW(), NOW(), 0);

-- =============================================
-- 2. 插入菜单数据 (sys_menu)
-- =============================================

-- 顶级菜单: 健身房管理
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('健身房管理', 'Gym Management', 1, 'ion:barbell-outline', '/gym', 10, 1, NOW(), NOW(), NULL, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym'));

-- =============================================
-- 2.1 8个页面子菜单（直接挂在健身房管理下）
-- =============================================

-- 课程类型
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '课程类型', 'Course Type', 2, 'ion:pricetags-outline', '/gym/course-type', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course-type')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 场地管理
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '场地管理', 'Location', 2, 'ion:location-outline', '/gym/location', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/location')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 课程管理
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '课程管理', 'Course', 2, 'ion:easel-outline', '/gym/course', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 预约管理
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '预约管理', 'Booking', 2, 'ion:calendar-outline', '/gym/booking', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/booking')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 教练管理
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '教练管理', 'Coach', 2, 'ion:person-outline', '/gym/coach', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 排班模板
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '排班模板', 'Schedule Template', 2, 'ion:calendar-number-outline', '/gym/coach-schedule-template', 5, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 排班调班
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '排班调班', 'Schedule Override', 2, 'ion:swap-horizontal-outline', '/gym/coach-schedule-override', 6, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-override')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- 教练课程
INSERT INTO `sys_menu` (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '教练课程', 'Coach Course', 2, 'ion:ribbon-outline', '/gym/coach-course', 7, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-course')
FROM (SELECT id FROM `sys_menu` WHERE router = '/gym') AS parent_menu;

-- =============================================
-- 3. 插入按钮级菜单 (type=3)
-- =============================================

-- 课程类型按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '课程类型列表', 'Index', 3, '/gym/course-type', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course-type/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程类型') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看课程类型', 'View', 3, '/gym/course-type', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course-type/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程类型') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建课程类型', 'Create', 3, '/gym/course-type', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course-type/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程类型') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '修改课程类型', 'Update', 3, '/gym/course-type', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course-type/update')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程类型') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除课程类型', 'Delete', 3, '/gym/course-type', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course-type/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程类型') AS parent_menu;

-- 场地管理按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '场地列表', 'Index', 3, '/gym/location', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/location/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '场地管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看场地', 'View', 3, '/gym/location', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/location/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '场地管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建场地', 'Create', 3, '/gym/location', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/location/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '场地管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '修改场地', 'Update', 3, '/gym/location', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/location/update')
FROM (SELECT id FROM `sys_menu` WHERE label = '场地管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除场地', 'Delete', 3, '/gym/location', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/location/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '场地管理') AS parent_menu;

-- 课程管理按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '课程列表', 'Index', 3, '/gym/course', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看课程', 'View', 3, '/gym/course', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建课程', 'Create', 3, '/gym/course', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '修改课程', 'Update', 3, '/gym/course', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course/update')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除课程', 'Delete', 3, '/gym/course', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看课次', 'View Session', 3, '/gym/course', 5, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/course/session')
FROM (SELECT id FROM `sys_menu` WHERE label = '课程管理') AS parent_menu;

-- 预约管理按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '预约列表', 'Index', 3, '/gym/booking', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/booking/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '预约管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看预约', 'View', 3, '/gym/booking', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/booking/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '预约管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建预约', 'Create', 3, '/gym/booking', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/booking/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '预约管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除预约', 'Delete', 3, '/gym/booking', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/booking/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '预约管理') AS parent_menu;

-- 教练管理按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '教练列表', 'Index', 3, '/gym/coach', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看教练', 'View', 3, '/gym/coach', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建教练', 'Create', 3, '/gym/coach', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '修改教练', 'Update', 3, '/gym/coach', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach/update')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除教练', 'Delete', 3, '/gym/coach', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练管理') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看排班', 'View Schedule', 3, '/gym/coach', 5, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach/schedule')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练管理') AS parent_menu;

-- 排班模板按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '排班模板列表', 'Index', 3, '/gym/coach-schedule-template', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班模板') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看排班模板', 'View', 3, '/gym/coach-schedule-template', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班模板') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建排班模板', 'Create', 3, '/gym/coach-schedule-template', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班模板') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '修改排班模板', 'Update', 3, '/gym/coach-schedule-template', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template/update')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班模板') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除排班模板', 'Delete', 3, '/gym/coach-schedule-template', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班模板') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '批量生成排班', 'Batch Generate', 3, '/gym/coach-schedule-template', 5, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-template/batchGenerate')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班模板') AS parent_menu;

-- 排班调班按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '排班调班列表', 'Index', 3, '/gym/coach-schedule-override', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-override/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班调班') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看排班调班', 'View', 3, '/gym/coach-schedule-override', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-override/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班调班') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建排班调班', 'Create', 3, '/gym/coach-schedule-override', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-override/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班调班') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '修改排班调班', 'Update', 3, '/gym/coach-schedule-override', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-override/update')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班调班') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除排班调班', 'Delete', 3, '/gym/coach-schedule-override', 4, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-schedule-override/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '排班调班') AS parent_menu;

-- 教练课程按钮
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '教练课程列表', 'Index', 3, '/gym/coach-course', 0, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-course/index')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练课程') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '查看教练课程', 'View', 3, '/gym/coach-course', 1, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-course/view')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练课程') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '创建教练课程', 'Create', 3, '/gym/coach-course', 2, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-course/create')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练课程') AS parent_menu;
INSERT INTO `sys_menu` (label, label_en, type, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
SELECT '删除教练课程', 'Delete', 3, '/gym/coach-course', 3, 1, NOW(), NOW(), parent_menu.id, 0, (SELECT id FROM `sys_permission` WHERE name = '/gym/coach-course/delete')
FROM (SELECT id FROM `sys_menu` WHERE label = '教练课程') AS parent_menu;

-- =============================================
-- 4. 插入健身房管理员角色 (sys_role)
--    注意: coach/member 角色由 SeedService 管理
-- =============================================

INSERT INTO `sys_role` (name, description, create_at, update_at, is_deleted)
SELECT * FROM (SELECT 'gym_admin' AS name, '健身房管理员' AS description, NOW() AS create_at, NOW() AS update_at, 0 AS is_deleted) AS src
WHERE NOT EXISTS (SELECT 1 FROM `sys_role` WHERE name = 'gym_admin');

-- =============================================
-- 5. 关联 admin 用户与健身房菜单（admin 拥有全部菜单）
-- =============================================

-- 顶级菜单
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='健身房管理'));

-- 8个子菜单
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='课程类型')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='场地管理')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='课程管理')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='预约管理')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='教练管理')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='排班模板')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='排班调班')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='教练课程'));

-- 课程类型按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='课程类型列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看课程类型')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建课程类型')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='修改课程类型')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除课程类型'));

-- 场地管理按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='场地列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看场地')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建场地')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='修改场地')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除场地'));

-- 课程管理按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='课程列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看课程')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建课程')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='修改课程')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除课程')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看课次'));

-- 预约管理按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='预约列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看预约')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建预约')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除预约'));

-- 教练管理按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='教练列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看教练')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建教练')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='修改教练')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除教练')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看排班'));

-- 排班模板按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='排班模板列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看排班模板')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建排班模板')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='修改排班模板')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除排班模板')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='批量生成排班'));

-- 排班调班按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='排班调班列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看排班调班')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建排班调班')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='修改排班调班')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除排班调班'));

-- 教练课程按钮
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='教练课程列表')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='查看教练课程')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='创建教练课程')),
    ((SELECT id FROM `sys_role` WHERE name='admin'), (SELECT id FROM `sys_menu` WHERE label='删除教练课程'));

-- =============================================
-- 6. 健身房管理员角色 (gym_admin) - 拥有全部健身房菜单权限
-- =============================================

-- 顶级菜单 + 全部子菜单
INSERT INTO `sys_role_menu` (role_id, menu_id)
VALUES
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='健身房管理')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='课程类型')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='场地管理')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='课程管理')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='预约管理')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='教练管理')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='排班模板')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='排班调班')),
    ((SELECT id FROM `sys_role` WHERE name='gym_admin'), (SELECT id FROM `sys_menu` WHERE label='教练课程'));

-- 全部按钮权限 (gym_admin)
INSERT INTO `sys_role_menu` (role_id, menu_id)
SELECT (SELECT id FROM `sys_role` WHERE name='gym_admin'), id
FROM `sys_menu` WHERE type = 3 AND router LIKE '/gym%';

-- coach/member 角色的健身房菜单授权由 SeedService 负责，此处不重复设置

COMMIT;
