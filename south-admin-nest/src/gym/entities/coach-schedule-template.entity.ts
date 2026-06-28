import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach_schedule_template')
export class CoachScheduleTemplate extends BaseEntity {
  @Column({ type: 'bigint' })
  coachId: number;

  @Column({ type: 'int', comment: '1=Monday ~ 7=Sunday' })
  dayOfWeek: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;
}
