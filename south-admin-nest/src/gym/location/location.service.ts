import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../entities/location.entity';
import { CreateLocationDto, UpdateLocationDto } from '../dto/location.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async page(dto: PaginationDto & { name?: string }) {
    const { page = 1, pageSize = 10, name } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.locationRepository
      .createQueryBuilder('location')
      .where('location.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('location.name LIKE :name', {
        name: `%${name}%`,
      });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('location.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location || location.isDeleted === 1) {
      throw new NotFoundException('地点不存在');
    }
    return location;
  }

  async create(dto: CreateLocationDto) {
    const location = this.locationRepository.create({
      name: dto.name,
      address: dto.address,
      capacity: dto.capacity,
    });
    return await this.locationRepository.save(location);
  }

  async update(id: number, dto: UpdateLocationDto) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location || location.isDeleted === 1) {
      throw new NotFoundException('地点不存在');
    }
    location.name = dto.name;
    location.address = dto.address;
    location.capacity = dto.capacity;
    return await this.locationRepository.save(location);
  }

  async delete(id: number) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location || location.isDeleted === 1) {
      throw new NotFoundException('地点不存在');
    }
    location.isDeleted = 1;
    location.deletedAt = new Date();
    await this.locationRepository.save(location);
  }

  async list() {
    return await this.locationRepository.find({
      where: { isDeleted: 0 },
      select: ['id', 'name', 'capacity'],
    });
  }
}
