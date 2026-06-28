import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach_schedule_override')
export class CoachScheduleOverride extends BaseEntity {
  @Column({ type: 'bigint' })
  coachId: number;

  @Column({ type: 'date' })
  overrideDate: Date;

  @Column({ type: 'int', comment: '1=请假 2=加班 3=换班' })
  type: number;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ length: 255, nullable: true })
  reason: string;
}
