import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色级访问控制守卫（按角色名称）。
 * 读取 @Roles(...) 设置的元数据，校验当前用户（由 JwtAuthGuard 注入到 request.user）
 * 的 roleNames 字段是否包含任一允许的角色名。
 *
 * 需在 CommonModule 中注册为 APP_GUARD，且必须排在 JwtAuthGuard 之后，
 * 以保证 request.user 已被填充。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 未标注 @Roles 的接口不做角色限制（仅保持登录校验）
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 超级管理员放行所有 @Roles 接口，保证最高权限账号可访问任意页面
    if (isSuperAdmin(user)) {
      return true;
    }

    const userRoleNames: string[] = Array.isArray(user?.roleNames)
      ? user.roleNames
      : Array.isArray(user?.roles)
        ? user.roles // 兼容：若直接放了名称数组
        : [];

    if (userRoleNames.length === 0) {
      throw new ForbiddenException('权限不足');
    }

    const hasRole = userRoleNames.some((name: string) =>
      requiredRoles.includes(name),
    );

    if (!hasRole) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }
}

/**
 * 判断是否为超级管理员：
 *   1) 用户名为 'admin'（与 init.sql / seed 约定一致），或
 *   2) 角色名含超级管理员标识（'系统管理员' / 'admin'）。
 * 超级管理员可访问所有 @Roles 受保护接口。
 */
function isSuperAdmin(user: any): boolean {
  if (!user) return false;
  if (user.username === 'admin') return true;
  const names: string[] = Array.isArray(user?.roleNames)
    ? user.roleNames
    : Array.isArray(user?.roles)
      ? user.roles
      : [];
  return names.some((n) => n === '系统管理员' || n === 'admin');
}
