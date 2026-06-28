import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CreateBookingDto } from '../dto/booking.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    private dataSource: DataSource,
  ) {}

  async page(
    dto: PaginationDto & { userId?: number; sessionId?: number; status?: number },
  ) {
    const { page = 1, pageSize = 10, userId, sessionId, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.isDeleted = :isDeleted', { isDeleted: 0 });

    if (userId) {
      queryBuilder.andWhere('booking.userId = :userId', { userId });
    }
    if (sessionId) {
      queryBuilder.andWhere('booking.sessionId = :sessionId', { sessionId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();

    return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async create(dto: CreateBookingDto) {
    return this.dataSource.transaction(async (manager) => {
      const sessionRepo = manager.getRepository(CourseSession);
      const bookingRepo = manager.getRepository(Booking);

      const session = await sessionRepo.findOne({
        where: { id: dto.sessionId, isDeleted: 0 },
      });

      if (!session) {
        throw new NotFoundException('课次不存在');
      }

      if (session.status !== 1) {
        throw new BadRequestException('该课次当前不可预约');
      }

      // Conflict detection: check for active booking by this user on this session
      const existingBooking = await bookingRepo.findOne({
        where: {
          sessionId: dto.sessionId,
          userId: dto.userId,
          status: 1,
          isDeleted: 0,
        },
      });

      if (existingBooking) {
        throw new ConflictException('您已预约该课次');
      }

      // Capacity check
      if (session.bookedCount >= session.capacity) {
        throw new BadRequestException('该课次预约已满');
      }

      const booking = bookingRepo.create({
        sessionId: dto.sessionId,
        userId: dto.userId,
        status: 1,
        remark: dto.remark,
      });
      const savedBooking = await bookingRepo.save(booking);

      // Atomically update session bookedCount and status
      session.bookedCount += 1;
      if (session.bookedCount >= session.capacity) {
        session.status = 2; // full
      }
      await sessionRepo.save(session);

      return savedBooking;
    });
  }

  async cancel(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const sessionRepo = manager.getRepository(CourseSession);

      const booking = await bookingRepo.findOne({ where: { id } });
      if (!booking || booking.isDeleted === 1) {
        throw new NotFoundException('预约不存在');
      }
      if (booking.status !== 1) {
        throw new BadRequestException('该预约无法取消');
      }

      booking.status = 2; // cancelled
      await bookingRepo.save(booking);

      // Decrement bookedCount and reopen session if it was full
      const session = await sessionRepo.findOne({
        where: { id: booking.sessionId, isDeleted: 0 },
      });
      if (session) {
        session.bookedCount = Math.max(0, session.bookedCount - 1);
        if (session.status === 2) {
          session.status = 1; // reopen
        }
        await sessionRepo.save(session);
      }
    });
  }

  async delete(id: number) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking || booking.isDeleted === 1) {
      throw new NotFoundException('预约不存在');
    }
    booking.isDeleted = 1;
    booking.deletedAt = new Date();
    await this.bookingRepository.save(booking);
  }
}
