import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberBookingDto } from './dto/member-booking.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserInfo } from '../../common/decorators/current-user.decorator';

/**
 * 会员端接口。所有接口均要求会员角色（sys_role.name = 'member'）。
 * userId 一律从登录态取，避免越权。
 */
@Controller('member')
@Roles('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  /** 浏览可约课程 */
  @Get('courses')
  async courses(@Query() dto: any) {
    return await this.memberService.courses(dto);
  }

  /** 查看课程下的课次 */
  @Get('courses/:courseId/sessions')
  async sessions(@Param('courseId') courseId: number) {
    return await this.memberService.sessions(Number(courseId));
  }

  /** 发起预约 */
  @Post('bookings')
  async book(@CurrentUser() user: UserInfo, @Body() dto: MemberBookingDto) {
    return await this.memberService.book(user.id, dto);
  }

  /** 取消预约 */
  @Post('bookings/:id/cancel')
  async cancel(@CurrentUser() user: UserInfo, @Param('id') id: number) {
    return await this.memberService.cancel(user.id, Number(id));
  }

  /** 我的预约 */
  @Get('bookings')
  async myBookings(@CurrentUser() user: UserInfo, @Query() dto: any) {
    return await this.memberService.myBookings(user.id, dto);
  }
}
