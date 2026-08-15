import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';
import { Coach } from '../entities/coach.entity';
import {
  CreateCoachScheduleTemplateDto,
  UpdateCoachScheduleTemplateDto,
  BatchGenerateDto,
} from '../dto/coach-schedule-template.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachScheduleTemplateService {
  constructor(
    @InjectRepository(CoachScheduleTemplate)
    private templateRepository: Repository<CoachScheduleTemplate>,
    @InjectRepository(CoachScheduleOverride)
    private overrideRepository: Repository<CoachScheduleOverride>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async page(dto: PaginationDto & { coachId?: number; dayOfWeek?: number }) {
    const { page = 1, pageSize = 10, coachId, dayOfWeek } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.templateRepository
      .createQueryBuilder('template')
      .where('template.isDeleted = :isDeleted', { isDeleted: 0 });

    if (coachId) {
      queryBuilder.andWhere('template.coachId = :coachId', { coachId });
    }
    if (dayOfWeek) {
      queryBuilder.andWhere('template.dayOfWeek = :dayOfWeek', { dayOfWeek });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('template.dayOfWeek', 'ASC')
      .addOrderBy('template.startTime', 'ASC')
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
    }));

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * 检查时间段是否与已有模板冲突
   * 时间重叠条件：newStart < existEnd && newEnd > existStart
   */
  private async checkTimeOverlap(
    coachId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ) {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.coachId = :coachId', { coachId })
      .andWhere('template.dayOfWeek = :dayOfWeek', { dayOfWeek })
      .andWhere('template.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('template.startTime < :endTime', { endTime })
      .andWhere('template.endTime > :startTime', { startTime });

    if (excludeId) {
      query.andWhere('template.id != :excludeId', { excludeId });
    }

    const conflict = await query.getOne();
    if (conflict) {
      throw new BadRequestException(
        `该时段与已有排班（${conflict.startTime} - ${conflict.endTime}）存在冲突`,
      );
    }
  }

  async create(dto: CreateCoachScheduleTemplateDto) {
    await this.checkTimeOverlap(dto.coachId, dto.dayOfWeek, dto.startTime, dto.endTime);

    const template = this.templateRepository.create({
      coachId: dto.coachId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });
    return await this.templateRepository.save(template);
  }

  async update(id: number, dto: UpdateCoachScheduleTemplateDto) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template || template.isDeleted === 1) {
      throw new NotFoundException('排班模板不存在');
    }

    const coachId = template.coachId;
    const dayOfWeek = dto.dayOfWeek ?? template.dayOfWeek;
    const startTime = dto.startTime ?? template.startTime;
    const endTime = dto.endTime ?? template.endTime;

    await this.checkTimeOverlap(coachId, dayOfWeek, startTime, endTime, id);

    if (dto.dayOfWeek !== undefined) template.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime !== undefined) template.startTime = dto.startTime;
    if (dto.endTime !== undefined) template.endTime = dto.endTime;
    return await this.templateRepository.save(template);
  }

  async delete(id: number) {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template || template.isDeleted === 1) {
      throw new NotFoundException('排班模板不存在');
    }
    template.isDeleted = 1;
    template.deletedAt = new Date();
    await this.templateRepository.save(template);
  }

  async batchGenerate(dto: BatchGenerateDto) {
    const templates = await this.templateRepository.find({
      where: { coachId: dto.coachId, isDeleted: 0 },
    });

    if (!templates.length) {
      throw new BadRequestException('该教练没有排班模板');
    }

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    // Get overrides (type=1 = leave) to skip
    const overrides = await this.overrideRepository.find({
      where: {
        coachId: dto.coachId,
        type: 1,
        isDeleted: 0,
      },
    });
    const leaveDates = new Set(
      overrides.map((o) => new Date(o.overrideDate).toISOString().split('T')[0]),
    );

    const records: CoachScheduleTemplate[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay(); // JS: 0=Sun -> 7
      const dateStr = current.toISOString().split('T')[0];

      if (!leaveDates.has(dateStr)) {
        const matchingTemplates = templates.filter((t) => t.dayOfWeek === dayOfWeek);
        for (const tmpl of matchingTemplates) {
          records.push(
            this.templateRepository.create({
              coachId: dto.coachId,
              dayOfWeek: tmpl.dayOfWeek,
              startTime: tmpl.startTime,
              endTime: tmpl.endTime,
            }),
          );
        }
      }

      current.setDate(current.getDate() + 1);
    }

    if (records.length) {
      await this.templateRepository.save(records);
    }

    return { generated: records.length };
  }
}
