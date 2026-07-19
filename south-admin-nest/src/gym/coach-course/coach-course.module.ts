import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachCourseController } from './coach-course.controller';
import { CoachCourseService } from './coach-course.service';
import { CoachCourse } from '../entities/coach-course.entity';
import { Coach } from '../entities/coach.entity';
import { Course } from '../entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachCourse, Coach, Course])],
  controllers: [CoachCourseController],
  providers: [CoachCourseService],
  exports: [CoachCourseService],
})
export class CoachCourseModule {}
