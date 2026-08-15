import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../system/entities/user.entity';
import { Role } from '../system/entities/role.entity';
import { Course } from '../gym/entities/course.entity';
import { CourseSession } from '../gym/entities/course-session.entity';
import { Booking } from '../gym/entities/booking.entity';
import { Coach } from '../gym/entities/coach.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Course, CourseSession, Booking, Coach]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
