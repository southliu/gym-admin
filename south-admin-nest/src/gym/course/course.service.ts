import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';
import { CourseType } from '../entities/course-type.entity';
import { Location } from '../entities/location.entity';
import { Coach } from '../entities/coach.entity';
import { CreateCourseDto, UpdateCourseDto } from '../dto/course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CourseService {
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
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async page(dto: PaginationDto & { name?: string; typeId?: number; status?: number }) {
    const { page = 1, pageSize = 10, name, typeId, status } = dto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .where('course.isDeleted = :isDeleted', { isDeleted: 0 });

    if (name) {
      queryBuilder.andWhere('course.name LIKE :name', { name: `%${name}%` });
    }
    if (typeId) {
      queryBuilder.andWhere('course.typeId = :typeId', { typeId });
    }
    if (status !== undefined) {
      queryBuilder.andWhere('course.status = :status', { status });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .orderBy('course.createdAt', 'DESC')
      .getManyAndCount();

    // 附带课程类型 / 场地 / 教练名称，便于后台展示
    const typeIds = [...new Set(items.map((c) => c.typeId).filter(Boolean))];
    const locationIds = [...new Set(items.map((c) => c.locationId).filter(Boolean))];
    const coachIds = [...new Set(items.map((c) => c.coachId).filter(Boolean))];
    const courseIds = items.map((c) => c.id);
    const typeMap = new Map(
      typeIds.length
        ? (await this.courseTypeRepository.find({ where: { id: In(typeIds) } })).map((t) => [t.id, t.name])
        : [],
    );
    const locationMap = new Map(
      locationIds.length
        ? (await this.locationRepository.find({ where: { id: In(locationIds) } })).map((l) => [l.id, l.name])
        : [],
    );
    const coachMap = new Map(
      coachIds.length
        ? (await this.coachRepository.find({ where: { id: In(coachIds) } })).map((c) => [c.id, c.name])
        : [],
    );

    // 取每个课程最早一节有效课次作为展示用的日期/时段，并统计总已约数
    const firstSessions = courseIds.length
      ? await this.sessionRepository
          .createQueryBuilder('s')
          .where('s.isDeleted = :isDeleted', { isDeleted: 0 })
          .andWhere('s.courseId IN (:...courseIds)', { courseIds })
          .orderBy('s.sessionDate', 'ASC')
          .addOrderBy('s.startTime', 'ASC')
          .getMany()
      : [];
    const firstSessionByCourse = new Map<number, CourseSession>();
    for (const s of firstSessions) {
      if (!firstSessionByCourse.has(s.courseId)) firstSessionByCourse.set(s.courseId, s);
    }
    const bookedByCourse = new Map<number, number>();
    if (firstSessions.length) {
      const sessionIds = firstSessions.map((s) => s.id);
      const rows = await this.bookingRepository
        .createQueryBuilder('b')
        .select('b.sessionId', 'sessionId')
        .addSelect('SUM(CASE WHEN b.status = 1 THEN 1 ELSE 0 END)', 'cnt')
        .where('b.isDeleted = :isDeleted', { isDeleted: 0 })
        .andWhere('b.sessionId IN (:...sessionIds)', { sessionIds })
        .groupBy('b.sessionId')
        .getRawMany();
      const cntBySession = new Map(rows.map((r) => [Number(r.sessionId), Number(r.cnt)]));
      for (const s of firstSessions) {
        bookedByCourse.set(
          s.courseId,
          (bookedByCourse.get(s.courseId) ?? 0) + (cntBySession.get(s.id) ?? 0),
        );
      }
    }

    const enriched = items.map((c) => {
      const first = firstSessionByCourse.get(c.id);
      return {
        ...c,
        courseTypeName: c.typeId ? typeMap.get(c.typeId) ?? null : null,
        locationName: c.locationId ? locationMap.get(c.locationId) ?? null : null,
        coachName: c.coachId ? coachMap.get(c.coachId) ?? null : null,
        startDate: first ? formatDate(first.sessionDate) : c.startDate ? formatDate(c.startDate) : null,
        startTime: first?.startTime ?? null,
        endTime: first?.endTime ?? null,
        bookedCount: bookedByCourse.get(c.id) ?? 0,
      };
    });

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  async detail(id: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }

    const sessions = await this.sessionRepository.find({
      where: { courseId: id, isDeleted: 0 },
      order: { sessionDate: 'ASC', startTime: 'ASC' },
    });

    const totalBookings = await this.bookingRepository.count({
      where: {
        sessionId: In(sessions.map((s) => s.id)),
        status: 1,
        isDeleted: 0,
      },
    });

    return { ...course, sessions, totalBookings };
  }

  async create(dto: CreateCourseDto) {
    const course = this.courseRepository.create({
      name: dto.name,
      typeId: dto.typeId,
      locationId: dto.locationId,
      coachId: dto.coachId,
      description: dto.description,
      capacity: dto.capacity,
      status: dto.status ?? 1,
      isRecurring: dto.isRecurring ?? false,
      repeatRule: dto.repeatRule ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      createdUser: dto.createdUser,
    });

    const savedCourse = await this.courseRepository.save(course);

    // Generate sessions
    if (dto.isRecurring && dto.repeatRule) {
      await this.generateRecurringSessions(savedCourse, dto);
    } else if (dto.startDate) {
      await this.generateSingleSession(savedCourse, dto);
    }

    return savedCourse;
  }

  async update(id: number, dto: UpdateCourseDto) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }

    if (dto.name !== undefined) course.name = dto.name;
    if (dto.typeId !== undefined) course.typeId = dto.typeId;
    if (dto.locationId !== undefined) course.locationId = dto.locationId;
    if (dto.coachId !== undefined) course.coachId = dto.coachId;
    if (dto.description !== undefined) course.description = dto.description;
    if (dto.capacity !== undefined) course.capacity = dto.capacity;
    if (dto.updatedUser !== undefined) course.updatedUser = dto.updatedUser;

    return await this.courseRepository.save(course);
  }

  async updateStatus(id: number, status: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }
    course.status = status;
    return await this.courseRepository.save(course);
  }

  async delete(id: number) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course || course.isDeleted === 1) {
      throw new NotFoundException('课程不存在');
    }

    // Soft delete course
    course.isDeleted = 1;
    course.deletedAt = new Date();
    await this.courseRepository.save(course);

    // Cancel all sessions and their bookings
    const sessions = await this.sessionRepository.find({
      where: { courseId: id, isDeleted: 0 },
    });
    for (const session of sessions) {
      session.isDeleted = 1;
      session.deletedAt = new Date();
      session.status = 3; // cancelled
      await this.sessionRepository.save(session);

      const bookings = await this.bookingRepository.find({
        where: { sessionId: session.id, status: 1, isDeleted: 0 },
      });
      for (const booking of bookings) {
        booking.status = 2; // cancelled
        await this.bookingRepository.save(booking);
      }
    }
  }

  async stats() {
    const totalCourses = await this.courseRepository.count({ where: { isDeleted: 0 } });
    const totalBookings = await this.bookingRepository.count({ where: { isDeleted: 0, status: 1 } });

    const topCourses = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.courseId', 'courseId')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .leftJoin(
        Booking,
        'booking',
        'booking.sessionId = session.id AND booking.status = 1 AND booking.isDeleted = 0',
      )
      .where('session.isDeleted = :isDeleted', { isDeleted: 0 })
      .groupBy('session.courseId')
      .orderBy('bookingCount', 'DESC')
      .limit(5)
      .getRawMany();

    return { totalCourses, totalBookings, topCourses };
  }

  private async generateSingleSession(course: Course, dto: CreateCourseDto) {
    const startDate = new Date(dto.startDate);
    const startTime = dto.startTime || '09:00:00';
    const endTime = dto.endTime || '10:00:00';

    const session = this.sessionRepository.create({
      courseId: course.id,
      sessionDate: startDate,
      startTime,
      endTime,
      capacity: course.capacity,
      bookedCount: 0,
      status: 1,
    });
    await this.sessionRepository.save(session);
  }

  private async generateRecurringSessions(course: Course, dto: CreateCourseDto) {
    const { repeatRule, startDate, startTime = '09:00:00', endTime = '10:00:00' } = dto;
    if (!repeatRule || !startDate) {
      throw new BadRequestException('周期课程需要提供重复规则和开始日期');
    }

    const { days, interval = 1, endDate } = repeatRule;
    if (!days || !days.length || !endDate) {
      throw new BadRequestException('重复规则需要提供星期几和结束日期');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const sessions: CourseSession[] = [];

    // Calculate total weeks to cover
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
    const totalWeeks = Math.ceil(totalDays / 7);

    for (let weekOffset = 0; weekOffset <= totalWeeks; weekOffset += interval) {
      for (const day of days) {
        // day: 1=Mon .. 7=Sun; JS: 0=Sun .. 6=Sat
        const targetDay = day === 7 ? 0 : day;
        const sessionDate = new Date(start);
        sessionDate.setDate(start.getDate() + weekOffset * 7 + ((targetDay - start.getDay() + 7) % 7));

        if (sessionDate >= start && sessionDate <= end) {
          const session = this.sessionRepository.create({
            courseId: course.id,
            sessionDate,
            startTime,
            endTime,
            capacity: course.capacity,
            bookedCount: 0,
            status: 1,
          });
          sessions.push(session);
        }
      }
    }

    if (sessions.length === 0) {
      throw new BadRequestException('重复规则未匹配到任何日期');
    }

    await this.sessionRepository.save(sessions);
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
