-- 清理所有健身房菜单数据，重新导入请重启后端让 SeedService 自动运行 gym-init.sql
START TRANSACTION;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 删除 sys_role_menu 中的健身房关联
DELETE FROM `sys_role_menu` WHERE menu_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_menu` WHERE router LIKE '/gym%') AS tmp
);

-- 2. 删除按钮菜单（type=3，依赖 permission）
DELETE FROM `sys_menu` WHERE permission_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_permission` WHERE name LIKE '/gym%') AS tmp
);

-- 3. 删除所有健身房菜单
DELETE FROM `sys_menu` WHERE router LIKE '/gym%';

-- 4. 删除所有健身房权限
DELETE FROM `sys_permission` WHERE name LIKE '/gym%';

-- 5. 删除 gym_admin 角色关联
DELETE FROM `sys_user_role` WHERE role_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_role` WHERE name = 'gym_admin') AS tmp
);
DELETE FROM `sys_role_menu` WHERE role_id IN (
  SELECT tmp.id FROM (SELECT id FROM `sys_role` WHERE name = 'gym_admin') AS tmp
);
DELETE FROM `sys_role` WHERE name = 'gym_admin';

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- 验证：应该是 0 行
SELECT COUNT(*) AS gym_menu_count FROM `sys_menu` WHERE router LIKE '/gym%';
