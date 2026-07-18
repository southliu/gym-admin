import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 标注接口所需的角色名称（对应 sys_role.name）。
 * 与 RolesGuard 配合使用，对 JWT payload 中的 roleNames 字段做角色级访问控制。
 *
 * 用法：
 *   @Roles('coach')              // 仅允许教练访问
 *   @Roles('admin', 'coach')     // 允许管理员或教练
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
