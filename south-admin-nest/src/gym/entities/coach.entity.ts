import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('gym_coach')
export class Coach extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'int', nullable: true, comment: '1=男 2=女' })
  gender: number;

  @Column({ length: 255, nullable: true })
  specialties: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'int', default: 1, comment: '1=在职 2=离职' })
  status: number;

  // 关联的登录账号（sys_user.id），教练角色登录后据此定位自己的教练档案
  @Column({ type: 'bigint', nullable: true, name: 'user_id', comment: '关联 sys_user.id' })
  userId: number;
}
