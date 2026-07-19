import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';
import { Course } from '../entities/course.entity';
import { Coach } from '../entities/coach.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSession, Booking, Course, Coach])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
