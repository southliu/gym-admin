import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { CoachPortalController } from './coach-portal.controller';
import { CoachPortalService } from './coach-portal.service';
import { Course } from '../entities/course.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CourseType } from '../entities/course-type.entity';
import { Location } from '../entities/location.entity';
import { Booking } from '../entities/booking.entity';
import { Coach } from '../entities/coach.entity';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';

/**
 * 门户模块：聚合会员端与教练端的对外接口。
 * 复用 gym 业务实体，通过 @Roles 做角色级隔离。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      CourseSession,
      CourseType,
      Location,
      Booking,
      Coach,
      CoachScheduleTemplate,
      CoachScheduleOverride,
    ]),
  ],
  controllers: [MemberController, CoachPortalController],
  providers: [MemberService, CoachPortalService],
})
export class PortalModule {}
