import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_booking')
export class Booking extends BaseEntity {
  @Column({ type: 'bigint' })
  sessionId: number;

  @Column({ type: 'bigint' })
  userId: number;

  @Column({ type: 'int', default: 1, comment: '1=已预约 2=已取消 3=已签到' })
  status: number;

  @Column({ length: 255, nullable: true })
  remark: string;
}
