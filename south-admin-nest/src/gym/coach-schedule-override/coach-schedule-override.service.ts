import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';
import { Coach } from '../entities/coach.entity';
import {
  CreateCoachScheduleOverrideDto,
  UpdateCoachScheduleOverrideDto,
} from '../dto/coach-schedule-override.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachScheduleOverrideService {
  constructor(
    @InjectRepository(CoachScheduleOverride)
    private overrideRepository: Repository<CoachScheduleOverride>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async page(
    dto: PaginationDto & { coachId?: number; overrideDate?: string; type?: number },
  ) {
    const { page = 1, pageSize = 10, coachId, overrideDate, type } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.overrideRepository
      .createQueryBuilder('override')
      .where('override.isDeleted = :isDeleted', { isDeleted: 0 });

    if (coachId) {
      queryBuilder.andWhere('override.coachId = :coachId', { coachId });
    }
    if (overrideDate) {
      queryBuilder.andWhere('override.overrideDate = :overrideDate', { overrideDate });
    }
    if (type !== undefined) {
      queryBuilder.andWhere('override.type = :type', { type });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('override.overrideDate', 'DESC')
      .getManyAndCount();

    const coachIds = [...new Set(items.map((i) => i.coachId).filter(Boolean))];
    const coachMap = new Map(
      coachIds.length
        ? (await this.coachRepository.find({ where: { id: In(coachIds) } })).map((c) => [c.id, c.name])
        : [],
    );

    const enriched = items.map((i) => ({
      ...i,
      coachName: i.coachId ? coachMap.get(i.coachId) ?? null : null,
      date: i.overrideDate ? formatDate(i.overrideDate) : null,
    }));

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateCoachScheduleOverrideDto) {
    const override = this.overrideRepository.create({
      coachId: dto.coachId,
      overrideDate: new Date(dto.overrideDate),
      type: dto.type,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });
    return await this.overrideRepository.save(override);
  }

  async update(id: number, dto: UpdateCoachScheduleOverrideDto) {
    const override = await this.overrideRepository.findOne({ where: { id } });
    if (!override || override.isDeleted === 1) {
      throw new NotFoundException('排班调整不存在');
    }
    if (dto.overrideDate !== undefined) override.overrideDate = new Date(dto.overrideDate);
    if (dto.type !== undefined) override.type = dto.type;
    if (dto.startTime !== undefined) override.startTime = dto.startTime;
    if (dto.endTime !== undefined) override.endTime = dto.endTime;
    if (dto.reason !== undefined) override.reason = dto.reason;
    return await this.overrideRepository.save(override);
  }

  async delete(id: number) {
    const override = await this.overrideRepository.findOne({ where: { id } });
    if (!override || override.isDeleted === 1) {
      throw new NotFoundException('排班调整不存在');
    }
    override.isDeleted = 1;
    override.deletedAt = new Date();
    await this.overrideRepository.save(override);
  }
}

function formatDate(d: Date): string {
  if (!d) return '';
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
