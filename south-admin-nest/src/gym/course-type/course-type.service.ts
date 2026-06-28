import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseType } from '../entities/course-type.entity';
import { CreateCourseTypeDto, UpdateCourseTypeDto } from '../dto/course-type.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CourseTypeService {
  constructor(
    @InjectRepository(CourseType)
    private courseTypeRepository: Repository<CourseType>,
  ) {}

  async page(dto: PaginationDto & { name?: string }) {
    const { page = 1, pageSize = 10, name } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.courseTypeRepository
      .createQueryBuilder('courseType')
      .where('courseType.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('courseType.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('courseType.order', 'ASC')
      .addOrderBy('courseType.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const courseType = await this.courseTypeRepository.findOne({ where: { id } });
    if (!courseType || courseType.isDeleted === 1) {
      throw new NotFoundException('课程类型不存在');
    }
    return courseType;
  }

  async create(dto: CreateCourseTypeDto) {
    const courseType = this.courseTypeRepository.create({
      name: dto.name,
      description: dto.description,
      order: dto.order ?? 0,
    });
    return await this.courseTypeRepository.save(courseType);
  }

  async update(id: number, dto: UpdateCourseTypeDto) {
    const courseType = await this.courseTypeRepository.findOne({ where: { id } });
    if (!courseType || courseType.isDeleted === 1) {
      throw new NotFoundException('课程类型不存在');
    }
    courseType.name = dto.name;
    courseType.description = dto.description;
    courseType.order = dto.order ?? courseType.order;
    return await this.courseTypeRepository.save(courseType);
  }

  async delete(id: number) {
    const courseType = await this.courseTypeRepository.findOne({ where: { id } });
    if (!courseType || courseType.isDeleted === 1) {
      throw new NotFoundException('课程类型不存在');
    }
    courseType.isDeleted = 1;
    courseType.deletedAt = new Date();
    await this.courseTypeRepository.save(courseType);
  }

  async list() {
    return await this.courseTypeRepository.find({
      where: { isDeleted: 0 },
      select: ['id', 'name'],
      order: { order: 'ASC' },
    });
  }
}
