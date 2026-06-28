import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';
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

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateCoachScheduleTemplateDto) {
    // Check for duplicate template on same coach + day
    const existing = await this.templateRepository.findOne({
      where: {
        coachId: dto.coachId,
        dayOfWeek: dto.dayOfWeek,
        isDeleted: 0,
      },
    });

    if (existing) {
      throw new BadRequestException('该时段已有排班模板');
    }

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
