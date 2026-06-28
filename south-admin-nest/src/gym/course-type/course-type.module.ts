import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTypeController } from './course-type.controller';
import { CourseTypeService } from './course-type.service';
import { CourseType } from '../entities/course-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseType])],
  controllers: [CourseTypeController],
  providers: [CourseTypeService],
  exports: [CourseTypeService],
})
export class CourseTypeModule {}
