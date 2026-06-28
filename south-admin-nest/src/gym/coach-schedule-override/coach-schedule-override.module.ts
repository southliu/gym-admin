import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachScheduleOverrideController } from './coach-schedule-override.controller';
import { CoachScheduleOverrideService } from './coach-schedule-override.service';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoachScheduleOverride])],
  controllers: [CoachScheduleOverrideController],
  providers: [CoachScheduleOverrideService],
  exports: [CoachScheduleOverrideService],
})
export class CoachScheduleOverrideModule {}
