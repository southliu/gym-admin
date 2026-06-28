-- ============================================
-- South Admin 初始化数据脚本
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 清理现有数据
-- ============================================
DELETE FROM sys_role_menu;
DELETE FROM sys_user_role;
DELETE FROM sys_menu;
DELETE FROM sys_permission;
DELETE FROM sys_role;
DELETE FROM sys_user;

-- ============================================
-- 2. 插入用户表数据
-- ============================================
INSERT INTO sys_user (username, password, name, email, status, is_deleted, create_at, update_at)
VALUES
    ('admin', '$2b$10$07h7npcIysHutrLYCY3yWOhEqtGTCR88pDp66ZztkAdG7RJT/4ZDO', '系统管理员', 'admin@example.com', 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
    ('user1', '$2b$10$07h7npcIysHutrLYCY3yWOhEqtGTCR88pDp66ZztkAdG7RJT/4ZDO', '普通用户', 'user1@example.com', 1, 0, '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ============================================
-- 3. 插入角色表数据
-- ============================================
INSERT INTO sys_role (name, description, create_at, update_at, is_deleted)
VALUES
    ('系统管理员', '最高权限', '2025-01-01 00:00:00', '2025-01-01 00:00:00', 0),
    ('普通用户', '普通用户权限', '2025-01-01 00:00:00', '2025-01-01 00:00:00', 0);

-- ============================================
-- 4. 插入权限表数据
-- ============================================
INSERT INTO sys_permission (name, description, create_at, update_at) VALUES
('/dashboard', '查看仪表盘', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo', '查看示例菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/copy', '复制菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/editor', '编辑示例菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/wangEditor', 'WangEditor 示例', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/virtualScroll', '虚拟滚动示例', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/demo/watermark', '水印示例', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user', '用户管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/index', '用户列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/create', '创建用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/update', '修改用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/view', '查看用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/delete', '删除用户', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/user/authority', '用户权限配置', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role', '角色管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/index', '角色列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/create', '创建角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/update', '修改角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/view', '查看角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/role/delete', '删除角色', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu', '菜单管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/index', '菜单列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/create', '创建菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/update', '修改菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/view', '查看菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/authority/menu/delete', '删除菜单', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article', '文章管理', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/index', '文章列表', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/create', '创建文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/update', '修改文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/view', '查看文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/content/article/delete', '删除文章', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/link', '外部链接', '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ============================================
-- 5. 插入顶级菜单项
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('仪表盘', 'Dashboard', 2, 'la:tachometer-alt', '/dashboard', 0, 1, NOW(), NOW(), NULL, 0, (SELECT id FROM sys_permission WHERE name = '/dashboard'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('组件', 'Components', 1, 'fluent:box-20-regular', '/demo', 1, 1, NOW(), NOW(), NULL, 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('系统管理', 'System Management', 1, 'ion:settings-outline', '/system', 2, 1, NOW(), NOW(), NULL, 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('内容管理', 'Content Management', 1, 'majesticons:article-search-line', '/content', 3, 1, NOW(), NOW(), NULL, 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('外部链接', 'External Link', 2, 'material-symbols:link', 'https://ant-design.antgroup.com', 4, 1, NOW(), NOW(), NULL, 0, (SELECT id FROM sys_permission WHERE name = '/link'));

-- ============================================
-- 6. 插入组件子菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('剪切板', 'Copy', 2, NULL, '/demo/copy', 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/demo/copy'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('水印', 'Watermark', 2, NULL, '/demo/watermark', 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/demo/watermark'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('虚拟滚动', 'Virtual Scroll', 2, NULL, '/demo/virtualScroll', 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/demo/virtualScroll'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('富文本', 'Editor', 2, NULL, '/demo/editor', 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/demo/editor'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('动态路由参数', 'Dynamic', 2, NULL, '/demo/123/dynamic', 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo') AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('层级1', 'Level1', 1, NULL, '/demo/level1', 5, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo') AS t), 0, NULL);

-- ============================================
-- 7. 插入层级子菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('层级2', 'Level2', 1, NULL, '/demo/level1/level2', 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo/level1') AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('层级3', 'Level3', 2, NULL, '/demo/level1/layer2/layer3', 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/demo/level1/level2') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/demo/watermark'));

-- ============================================
-- 8. 插入系统管理子菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('用户管理', 'User Management', 2, NULL, '/system/user', 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('菜单管理', 'Menu Management', 2, NULL, '/system/menu', 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/menu'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('角色管理', 'Role Management', 2, NULL, '/system/role', 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/role'));

-- ============================================
-- 9. 插入内容管理子菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('文章管理', 'Article Management', 2, NULL, '/content/article', 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/content') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/content/article'));

-- ============================================
-- 10. 插入用户管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('用户列表', 'Index', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/user') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user/index'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看用户', 'View', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/user') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建用户', 'Create', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/user') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改用户', 'Update', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/user') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除用户', 'Delete', 3, NULL, NULL, 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/user') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user/delete'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('用户权限按钮', 'Authority', 3, NULL, NULL, 5, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/user') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/user/authority'));

-- ============================================
-- 11. 插入菜单管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('菜单列表', 'Index', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/menu') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/menu/index'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看菜单', 'View', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/menu') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/menu/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建菜单', 'Create', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/menu') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/menu/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改菜单', 'Update', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/menu') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/menu/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除菜单', 'Delete', 3, NULL, NULL, 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/menu') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/menu/delete'));

-- ============================================
-- 12. 插入角色管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('角色列表', 'Index', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/role') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/role/index'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看角色', 'View', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/role') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/role/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建角色', 'Create', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/role') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/role/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改角色', 'Update', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/role') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/role/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除角色', 'Delete', 3, NULL, NULL, 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/system/role') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/authority/role/delete'));

-- ============================================
-- 13. 插入文章管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看文章', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/content/article') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/content/article/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建文章', 'Create', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/content/article') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/content/article/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改文章', 'Update', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/content/article') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/content/article/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除文章', 'Delete', 3, NULL, NULL, 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/content/article') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/content/article/delete'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('文章列表', 'Index', 3, NULL, NULL, 5, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/content/article') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/content/article/index'));

-- ============================================
-- 14. 插入课程管理模块权限
-- ============================================
INSERT INTO sys_permission (name, description, create_at, update_at) VALUES
('/gym/course', '课程管理模块', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-type/view', '查看课程类型', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-type/create', '创建课程类型', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-type/update', '修改课程类型', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-type/delete', '删除课程类型', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-location/view', '查看课程地点', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-location/create', '创建课程地点', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-location/update', '修改课程地点', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course-location/delete', '删除课程地点', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course/view', '查看课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course/create', '创建课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course/update', '修改课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/course/delete', '删除课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/booking/view', '查看预约', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/booking/create', '创建预约', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/booking/update', '修改预约', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/booking/delete', '删除预约', '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ============================================
-- 15. 插入课程管理目录菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('课程管理', 'Course Management', 1, 'mdi:dumbbell', '/gym', 5, 1, NOW(), NOW(), NULL, 0, (SELECT id FROM sys_permission WHERE name = '/gym/course'));

-- ============================================
-- 16. 插入课程管理子菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('课程类型', 'Course Type', 2, NULL, '/gym/course-type', 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym') AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('课程地点', 'Course Location', 2, NULL, '/gym/course-location', 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym') AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('课程管理', 'Course', 2, NULL, '/gym/course', 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym') AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('预约管理', 'Booking', 2, NULL, '/gym/booking', 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym') AS t), 0, NULL);

-- ============================================
-- 17. 插入课程类型按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看课程类型', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-type') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-type/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建课程类型', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-type') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-type/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改课程类型', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-type') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-type/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除课程类型', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-type') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-type/delete'));

-- ============================================
-- 18. 插入课程地点按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看课程地点', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-location') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-location/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建课程地点', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-location') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-location/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改课程地点', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-location') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-location/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除课程地点', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course-location') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course-location/delete'));

-- ============================================
-- 19. 插入课程管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看课程', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建课程', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改课程', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除课程', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/course/delete'));

-- ============================================
-- 20. 插入预约管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看预约', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/booking') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/booking/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建预约', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/booking') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/booking/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改预约', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/booking') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/booking/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除预约', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/booking') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/booking/delete'));

-- ============================================
-- 21. 插入教练管理模块权限
-- ============================================
INSERT INTO sys_permission (name, description, create_at, update_at) VALUES
('/gym/coach', '教练管理模块', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach/view', '查看教练', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach/create', '创建教练', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach/update', '修改教练', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach/delete', '删除教练', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach/schedule', '查看排班', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-course', '教练课程管理模块', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-course/view', '查看教练课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-course/create', '创建教练课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-course/delete', '删除教练课程', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-template', '排班模板管理模块', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-template/view', '查看排班模板', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-template/create', '创建排班模板', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-template/update', '修改排班模板', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-template/delete', '删除排班模板', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-template/batchGenerate', '批量生成排班', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-override', '排班覆盖管理模块', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-override/view', '查看排班覆盖', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-override/create', '创建排班覆盖', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-override/update', '修改排班覆盖', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
('/gym/coach-schedule-override/delete', '删除排班覆盖', '2025-01-01 00:00:00', '2025-01-01 00:00:00');

-- ============================================
-- 22. 插入教练管理子菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('教练管理', 'Coach Management', 2, NULL, '/gym/coach', 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym' AND type = 1) AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('教练课程', 'Coach Course', 2, NULL, '/gym/coach-course', 5, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym' AND type = 1) AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('排班模板', 'Schedule Template', 2, NULL, '/gym/coach-schedule-template', 6, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym' AND type = 1) AS t), 0, NULL);

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('排班覆盖', 'Schedule Override', 2, NULL, '/gym/coach-schedule-override', 7, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym' AND type = 1) AS t), 0, NULL);

-- ============================================
-- 23. 插入教练管理按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看教练', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建教练', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改教练', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除教练', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach/delete'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看排班', 'View Schedule', 3, NULL, NULL, 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach/schedule'));

-- ============================================
-- 24. 插入教练课程按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看教练课程', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-course/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建教练课程', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-course/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除教练课程', 'Delete', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-course') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-course/delete'));

-- ============================================
-- 25. 插入排班模板按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看排班模板', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-template') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-template/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建排班模板', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-template') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-template/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改排班模板', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-template') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-template/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除排班模板', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-template') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-template/delete'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('批量生成排班', 'Batch Generate', 3, NULL, NULL, 4, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-template') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-template/batchGenerate'));

-- ============================================
-- 26. 插入排班覆盖按钮菜单
-- ============================================
INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('查看排班覆盖', 'View', 3, NULL, NULL, 0, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-override') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-override/view'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('创建排班覆盖', 'Create', 3, NULL, NULL, 1, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-override') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-override/create'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('修改排班覆盖', 'Update', 3, NULL, NULL, 2, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-override') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-override/update'));

INSERT INTO sys_menu (label, label_en, type, icon, router, `order`, state, create_at, update_at, parent_id, is_deleted, permission_id)
VALUES ('删除排班覆盖', 'Delete', 3, NULL, NULL, 3, 1, NOW(), NOW(), (SELECT id FROM (SELECT id FROM sys_menu WHERE router = '/gym/coach-schedule-override') AS t), 0, (SELECT id FROM sys_permission WHERE name = '/gym/coach-schedule-override/delete'));

-- ============================================
-- 27. 关联用户与角色
-- ============================================
INSERT INTO sys_user_role (user_id, role_id)
VALUES ((SELECT id FROM sys_user WHERE username = 'admin'), (SELECT id FROM sys_role WHERE name = '系统管理员'));

INSERT INTO sys_user_role (user_id, role_id)
VALUES ((SELECT id FROM sys_user WHERE username = 'user1'), (SELECT id FROM sys_role WHERE name = '普通用户'));

-- ============================================
-- 28. 关联角色与菜单
-- ============================================
INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '仪表盘'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '组件'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '系统管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '内容管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '外部链接'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '剪切板'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '水印'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '虚拟滚动'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '富文本'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '动态路由参数'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '层级1'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '层级2'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '层级3'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '用户管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '菜单管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '角色管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '文章管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '用户列表'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看用户'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建用户'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改用户'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除用户'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '用户权限按钮'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '菜单列表'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看菜单'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建菜单'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改菜单'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除菜单'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '角色列表'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看角色'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建角色'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改角色'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除角色'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '文章列表'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看文章'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建文章'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改文章'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除文章'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '课程管理' AND type = 1));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '课程类型'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '课程地点'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '课程管理' AND type = 2));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '预约管理'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看课程类型'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建课程类型'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改课程类型'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除课程类型'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看课程地点'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建课程地点'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改课程地点'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除课程地点'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看预约'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建预约'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改预约'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除预约'));

-- ============================================
-- 29. 关联教练管理菜单与角色
-- ============================================
INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '教练管理' AND type = 2));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '教练课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '排班模板'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '排班覆盖'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看教练'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建教练'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改教练'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除教练'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看排班'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看教练课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建教练课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除教练课程'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看排班模板'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建排班模板'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改排班模板'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除排班模板'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '批量生成排班'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '查看排班覆盖'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '创建排班覆盖'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '修改排班覆盖'));

INSERT INTO sys_role_menu (role_id, menu_id)
VALUES ((SELECT id FROM sys_role WHERE name = '系统管理员'), (SELECT id FROM sys_menu WHERE label = '删除排班覆盖'));

SET FOREIGN_KEY_CHECKS = 1;
