import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach_course')
export class CoachCourse extends BaseEntity {
  @Column({ type: 'bigint' })
  coachId: number;

  @Column({ type: 'bigint' })
  courseId: number;
}
