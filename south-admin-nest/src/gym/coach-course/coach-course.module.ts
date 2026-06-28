import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachCourseController } from './coach-course.controller';
import { CoachCourseService } from './coach-course.service';
import { CoachCourse } from '../entities/coach-course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachCourse])],
  controllers: [CoachCourseController],
  providers: [CoachCourseService],
  exports: [CoachCourseService],
})
export class CoachCourseModule {}
