import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { CreateCoachDto, UpdateCoachDto } from '../dto/coach.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async page(dto: PaginationDto & { name?: string; status?: number; specialties?: string }) {
    const { page = 1, pageSize = 10, name, status, specialties } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.coachRepository
      .createQueryBuilder('coach')
      .where('coach.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('coach.name LIKE :name', { name: `%${name}%` });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('coach.status = :status', { status });
    }
    if (specialties) {
      queryBuilder.andWhere('coach.specialties LIKE :specialties', {
        specialties: `%${specialties}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('coach.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach || coach.isDeleted === 1) {
      throw new NotFoundException('教练不存在');
    }
    return coach;
  }

  async list() {
    return await this.coachRepository.find({
      where: { isDeleted: 0, status: 1 },
      select: ['id', 'name', 'specialties'],
    });
  }

  async create(dto: CreateCoachDto) {
    const coach = this.coachRepository.create({
      name: dto.name,
      phone: dto.phone,
      gender: dto.gender,
      specialties: dto.specialties,
      qualifications: dto.qualifications,
      avatar: dto.avatar,
      status: dto.status ?? 1,
    });
    return await this.coachRepository.save(coach);
  }

  async update(id: number, dto: UpdateCoachDto) {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach || coach.isDeleted === 1) {
      throw new NotFoundException('教练不存在');
    }
    if (dto.name !== undefined) coach.name = dto.name;
    if (dto.phone !== undefined) coach.phone = dto.phone;
    if (dto.gender !== undefined) coach.gender = dto.gender;
    if (dto.specialties !== undefined) coach.specialties = dto.specialties;
    if (dto.qualifications !== undefined) coach.qualifications = dto.qualifications;
    if (dto.avatar !== undefined) coach.avatar = dto.avatar;
    if (dto.status !== undefined) coach.status = dto.status;
    return await this.coachRepository.save(coach);
  }

  async delete(id: number) {
    const coach = await this.coachRepository.findOne({ where: { id } });
    if (!coach || coach.isDeleted === 1) {
      throw new NotFoundException('教练不存在');
    }
    coach.isDeleted = 1;
    coach.deletedAt = new Date();
    await this.coachRepository.save(coach);
  }
}
