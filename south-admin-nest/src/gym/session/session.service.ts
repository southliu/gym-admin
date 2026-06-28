import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';
import { UpdateSessionDto } from '../dto/session.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async page(dto: PaginationDto & { courseId?: number; sessionDate?: string; status?: number }) {
    const { page = 1, pageSize = 10, courseId, sessionDate, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.isDeleted = :isDeleted', { isDeleted: 0 });

    if (courseId) {
      queryBuilder.andWhere('session.courseId = :courseId', { courseId });
    }
    if (sessionDate) {
      queryBuilder.andWhere('session.sessionDate = :sessionDate', { sessionDate });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('session.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('session.sessionDate', 'ASC')
      .addOrderBy('session.startTime', 'ASC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.isDeleted === 1) {
      throw new NotFoundException('课次不存在');
    }

    const bookings = await this.bookingRepository.find({
      where: { sessionId: id, status: 1, isDeleted: 0 },
      order: { createdAt: 'DESC' },
    });

    return { ...session, bookings };
  }

  async updateStatus(id: number, status: number) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.isDeleted === 1) {
      throw new NotFoundException('课次不存在');
    }
    session.status = status;
    return await this.sessionRepository.save(session);
  }

  async update(id: number, dto: UpdateSessionDto) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session || session.isDeleted === 1) {
      throw new NotFoundException('课次不存在');
    }

    if (dto.sessionDate !== undefined) session.sessionDate = new Date(dto.sessionDate);
    if (dto.startTime !== undefined) session.startTime = dto.startTime;
    if (dto.endTime !== undefined) session.endTime = dto.endTime;
    if (dto.capacity !== undefined) session.capacity = dto.capacity;

    return await this.sessionRepository.save(session);
  }
}
