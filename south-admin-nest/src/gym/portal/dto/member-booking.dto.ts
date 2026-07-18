import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 会员发起预约的入参。userId 由服务端从登录态注入，无需前端传递。
 */
export class MemberBookingDto {
  @Type(() => Number)
  @IsInt()
  sessionId: number;

  @IsOptional()
  @IsString()
  remark?: string;
}
