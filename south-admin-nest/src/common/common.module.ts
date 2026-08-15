import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'south-admin-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    // 仅保留 JwtAuthGuard（登录校验），移除 RolesGuard（角色级 API 权限校验）
    // 页面/按钮/接口的权限判断已全部移除，仅保留菜单可见性过滤（前端 sidebar）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [JwtModule],
})
export class CommonModule {}
