import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseSession, Booking])],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
