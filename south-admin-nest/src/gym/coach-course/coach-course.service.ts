import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoachCourse } from '../entities/coach-course.entity';
import { CreateCoachCourseDto } from '../dto/coach-course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachCourseService {
  constructor(
    @InjectRepository(CoachCourse)
    private coachCourseRepository: Repository<CoachCourse>,
  ) {}

  async page(dto: PaginationDto & { coachId?: number; courseId?: number }) {
    const { page = 1, pageSize = 10, coachId, courseId } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.coachCourseRepository
      .createQueryBuilder('cc')
      .where('cc.isDeleted = :isDeleted', { isDeleted: 0 });

    if (coachId) {
      queryBuilder.andWhere('cc.coachId = :coachId', { coachId });
    }
    if (courseId) {
      queryBuilder.andWhere('cc.courseId = :courseId', { courseId });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('cc.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateCoachCourseDto) {
    // Check duplicate
    const existing = await this.coachCourseRepository.findOne({
      where: {
        coachId: dto.coachId,
        courseId: dto.courseId,
        isDeleted: 0,
      },
    });
    if (existing) {
      throw new BadRequestException('该教练已关联此课程');
    }

    const coachCourse = this.coachCourseRepository.create({
      coachId: dto.coachId,
      courseId: dto.courseId,
    });
    return await this.coachCourseRepository.save(coachCourse);
  }

  async delete(id: number) {
    const coachCourse = await this.coachCourseRepository.findOne({ where: { id } });
    if (!coachCourse || coachCourse.isDeleted === 1) {
      throw new NotFoundException('教练课程关联不存在');
    }
    coachCourse.isDeleted = 1;
    coachCourse.deletedAt = new Date();
    await this.coachCourseRepository.save(coachCourse);
  }
}
