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
}
