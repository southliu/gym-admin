import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_course_session')
export class CourseSession extends BaseEntity {
  @Column({ type: 'bigint' })
  courseId: number;

  @Column({ type: 'datetime' })
  sessionDate: Date;

  @Column({ length: 20 })
  startTime: string;

  @Column({ length: 20 })
  endTime: string;

  @Column({ type: 'int', default: 0 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  bookedCount: number;

  @Column({ type: 'int', default: 1, comment: '1=正常 2=已满 3=已取消 4=已结束' })
  status: number;
}
