import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_course')
export class Course extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'bigint' })
  typeId: number;

  @Column({ type: 'bigint' })
  locationId: number;

  @Column({ type: 'bigint', nullable: true })
  coachId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 1, comment: '1=开放预约 2=已满 3=已取消 4=已结束' })
  status: number;

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'simple-json', nullable: true })
  repeatRule: { freq: string; days: number[]; interval: number; endDate: string } | null;

  @Column({ type: 'datetime', nullable: true })
  startDate: Date;

  @Column({ length: 50, nullable: true })
  createdUser: string;

  @Column({ length: 50, nullable: true })
  updatedUser: string;
}
