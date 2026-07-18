import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoachPortalService } from './coach-portal.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserInfo } from '../../common/decorators/current-user.decorator';

/**
 * 教练端接口。所有接口均要求教练角色（sys_role.name = 'coach'）。
 * coachId 由登录账号 user_id 反查 gym_coach 得到。
 */
@Controller('coach')
@Roles('coach')
export class CoachPortalController {
  constructor(private readonly coachPortalService: CoachPortalService) {}

  /** 我的教练档案 */
  @Get('profile')
  async profile(@CurrentUser() user: UserInfo) {
    return await this.coachPortalService.profile(user.id);
  }

  /** 我负责的课程 */
  @Get('courses')
  async myCourses(@CurrentUser() user: UserInfo, @Query() dto: any) {
    return await this.coachPortalService.myCourses(user.id, dto);
  }

  /** 我的排班（模板 + 例外） */
  @Get('schedule')
  async mySchedule(@CurrentUser() user: UserInfo) {
    return await this.coachPortalService.mySchedule(user.id);
  }

  /** 我的课次 */
  @Get('sessions')
  async mySessions(@CurrentUser() user: UserInfo, @Query() dto: any) {
    return await this.coachPortalService.mySessions(user.id, dto);
  }

  /** 某节次的预约名单 */
  @Get('sessions/:id/bookings')
  async sessionBookings(
    @CurrentUser() user: UserInfo,
    @Param('id') id: number,
  ) {
    return await this.coachPortalService.sessionBookings(user.id, Number(id));
  }
}
