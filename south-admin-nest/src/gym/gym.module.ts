import { Module } from '@nestjs/common';
import { CourseTypeModule } from './course-type/course-type.module';
import { LocationModule } from './location/location.module';
import { CourseModule } from './course/course.module';
import { SessionModule } from './session/session.module';
import { BookingModule } from './booking/booking.module';
import { CoachScheduleTemplateModule } from './coach-schedule-template/coach-schedule-template.module';
import { CoachScheduleOverrideModule } from './coach-schedule-override/coach-schedule-override.module';
import { CoachCourseModule } from './coach-course/coach-course.module';
import { CoachModule } from './coach/coach.module';

@Module({
  imports: [
    CourseTypeModule,
    LocationModule,
    CourseModule,
    SessionModule,
    BookingModule,
    CoachModule,
    CoachScheduleTemplateModule,
    CoachScheduleOverrideModule,
    CoachCourseModule,
  ],
  exports: [
    CourseTypeModule,
    LocationModule,
    CourseModule,
    SessionModule,
    BookingModule,
    CoachModule,
    CoachScheduleTemplateModule,
    CoachScheduleOverrideModule,
    CoachCourseModule,
  ],
})
export class GymModule {}
