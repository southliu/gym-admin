/**
 * 检测是否有权限
 *
 * 基于后端返回的 permissions 数组进行匹配。
 * 菜单可见性仍由 `src/menus/utils/helper.ts` 的 `hasPermission` 控制（基于 menu.rule）。
 *
 * @param value - 权限标识，如 '/gym/course/delete'
 * @param permissions - 后端返回的权限列表
 */
export const checkPermission = (value: string, permissions: string[]): boolean => {
  return permissions.includes(value);
};
