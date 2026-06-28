import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachScheduleTemplateController } from './coach-schedule-template.controller';
import { CoachScheduleTemplateService } from './coach-schedule-template.service';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachScheduleTemplate, CoachScheduleOverride])],
  controllers: [CoachScheduleTemplateController],
  providers: [CoachScheduleTemplateService],
  exports: [CoachScheduleTemplateService],
})
export class CoachScheduleTemplateModule {}
