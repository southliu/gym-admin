import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from '../entities/booking.entity';
import { CourseSession } from '../entities/course-session.entity';
import { Course } from '../entities/course.entity';
import { User } from '../../system/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, CourseSession, Course, User])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
