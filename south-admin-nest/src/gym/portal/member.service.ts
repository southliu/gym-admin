import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CourseType } from '../entities/course-type.entity';
import { Location } from '../entities/location.entity';
import { Booking } from '../entities/booking.entity';
import { MemberBookingDto } from './dto/member-booking.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * 会员端业务：浏览可约课程、查看课次、发起/取消预约、查看自己的预约记录。
 * 浏览类接口不限制角色，写操作由 MemberController 通过 @Roles 限制为会员角色，userId 取自登录态。
 */
@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(CourseType)
    private courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private dataSource: DataSource,
  ) {}

  /** 浏览可预约课程（仅返回开放预约的课程）。 */
  async courses(
    dto: PaginationDto & { name?: string; typeId?: number },
  ) {
    const { page = 1, pageSize = 10, name, typeId } = dto;
    const skip = (page - 1) * pageSize;

    const qb = this.courseRepository
      .createQueryBuilder('course')
      .where('course.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('course.status = :status', { status: 1 }); // 1=开放预约

    if (name) {
      qb.andWhere('course.name LIKE :name', { name: `%${name}%` });
    }
    if (typeId) {
      qb.andWhere('course.typeId = :typeId', { typeId });
    }

    const [items, total] = await qb
      .skip(skip)
      .take(pageSize)
      .orderBy('course.createdAt', 'DESC')
      .getManyAndCount();

    // 附带课程类型与场地名称，便于会员端展示
    const typeIds = [...new Set(items.map((c) => c.typeId).filter(Boolean))];
    const locationIds = [...new Set(items.map((c) => c.locationId).filter(Boolean))];
    const types = typeIds.length
      ? await this.courseTypeRepository.find({ where: { id: In(typeIds) } })
      : [];
    const locations = locationIds.length
      ? await this.locationRepository.find({ where: { id: In(locationIds) } })
      : [];
    const typeMap = new Map(types.map((t) => [t.id, t.name]));
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));

    const enriched = items.map((c) => ({
      ...c,
      typeName: c.typeId ? typeMap.get(c.typeId) ?? null : null,
      locationName: c.locationId ? locationMap.get(c.locationId) ?? null : null,
    }));

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  /** 查看课程的课次列表（仅返回正常/可约的课次）。 */
  async sessions(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, isDeleted: 0 },
    });
    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    const sessions = await this.sessionRepository.find({
      where: {
        courseId,
        isDeleted: 0,
        status: In([1, 2]), // 1=正常 2=已满（已满仍可查看，但不可预约）
      },
      order: { sessionDate: 'ASC', startTime: 'ASC' },
    });

    return { course, sessions };
  }

  /** 发起预约：会员身份由登录态注入，自动做冲突检测与容量控制。 */
  async book(userId: number, dto: MemberBookingDto) {
    if (!userId) {
      throw new ForbiddenException('无法识别会员身份');
    }

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

      // 冲突检测：同一会员对同一课次的活跃预约
      const existing = await bookingRepo.findOne({
        where: {
          sessionId: dto.sessionId,
          userId,
          status: 1,
          isDeleted: 0,
        },
      });
      if (existing) {
        throw new ConflictException('您已预约该课次');
      }

      // 容量控制
      if (session.bookedCount >= session.capacity) {
        throw new BadRequestException('该课次预约已满');
      }

      const booking = bookingRepo.create({
        sessionId: dto.sessionId,
        userId,
        status: 1,
        remark: dto.remark,
      });
      const saved = await bookingRepo.save(booking);

      // 原子更新课次已约数与状态
      session.bookedCount += 1;
      if (session.bookedCount >= session.capacity) {
        session.status = 2; // 已满
      }
      await sessionRepo.save(session);

      return saved;
    });
  }

  /** 取消预约：仅允许会员取消属于自己的、状态为已预约的记录。 */
  async cancel(userId: number, bookingId: number) {
    if (!userId) {
      throw new ForbiddenException('无法识别会员身份');
    }

    return this.dataSource.transaction(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const sessionRepo = manager.getRepository(CourseSession);

      const booking = await bookingRepo.findOne({
        where: { id: bookingId, isDeleted: 0 },
      });
      if (!booking) {
        throw new NotFoundException('预约不存在');
      }
      if (booking.userId !== userId) {
        throw new ForbiddenException('只能取消自己的预约');
      }
      if (booking.status !== 1) {
        throw new BadRequestException('该预约无法取消');
      }

      booking.status = 2; // 已取消
      await bookingRepo.save(booking);

      const session = await sessionRepo.findOne({
        where: { id: booking.sessionId, isDeleted: 0 },
      });
      if (session && session.bookedCount > 0) {
        session.bookedCount -= 1;
        if (session.status === 2) {
          session.status = 1; // 重新开放
        }
        await sessionRepo.save(session);
      }

      return { message: '取消成功' };
    });
  }

  /** 我的预约：按登录会员的 userId 过滤，支持状态筛选。 */
  async myBookings(
    userId: number,
    dto: PaginationDto & { status?: number },
  ) {
    if (!userId) {
      throw new ForbiddenException('无法识别会员身份');
    }
    const { page = 1, pageSize = 10, status } = dto;
    const skip = (page - 1) * pageSize;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('booking.userId = :userId', { userId });

    if (status !== undefined) {
      qb.andWhere('booking.status = :status', { status });
    }

    const [items, total] = await qb
      .skip(skip)
      .take(pageSize)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();

    // 附带课次与课程信息，便于会员端展示
    const sessionIds = [...new Set(items.map((b) => b.sessionId))];
    let sessionMap = new Map<number, CourseSession>();
    let courseMap = new Map<number, Course>();
    if (sessionIds.length) {
      const sessions = await this.sessionRepository.find({
        where: { id: In(sessionIds), isDeleted: 0 },
      });
      sessionMap = new Map(sessions.map((s) => [s.id, s]));
      const courseIds = [...new Set(sessions.map((s) => s.courseId))];
      if (courseIds.length) {
        const courses = await this.courseRepository.find({
          where: { id: In(courseIds), isDeleted: 0 },
        });
        courseMap = new Map(courses.map((c) => [c.id, c]));
      }
    }

    const enriched = items.map((b) => {
      const session = sessionMap.get(b.sessionId);
      const course = session ? courseMap.get(session.courseId) : undefined;
      return {
        ...b,
        session: session
          ? {
              id: session.id,
              sessionDate: session.sessionDate
                ? new Date(session.sessionDate).toISOString().split('T')[0]
                : null,
              startTime: session.startTime,
              endTime: session.endTime,
              courseName: course?.name ?? null,
              location: null,
            }
          : null,
      };
    });

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }
}
