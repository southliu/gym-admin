import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CourseSession } from '../entities/course-session.entity';
import { Booking } from '../entities/booking.entity';
import { Course } from '../entities/course.entity';
import { Coach } from '../entities/coach.entity';
import { UpdateSessionDto } from '../dto/session.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
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

    // 附带课程名 / 教练名（教练取课程的 coachId），便于展示
    const courseIds = [...new Set(items.map((s) => s.courseId).filter(Boolean))];
    let courseMap = new Map<number, Course>();
    if (courseIds.length) {
      const courses = await this.courseRepository.find({ where: { id: In(courseIds) } });
      courseMap = new Map(courses.map((c) => [c.id, c]));
      const coachIds = [...new Set(courses.map((c) => c.coachId).filter(Boolean))];
      const coachMap = new Map(
        coachIds.length
          ? (await this.coachRepository.find({ where: { id: In(coachIds) } })).map((c) => [c.id, c.name])
          : [],
      );
      const enriched = items.map((s, idx) => {
        const course = courseMap.get(s.courseId);
        return {
          ...s,
          sessionNumber: idx + 1 + skip,
          date: formatDate(s.sessionDate),
          courseName: course?.name ?? null,
          instructorName: course?.coachId ? coachMap.get(course.coachId) ?? null : null,
        };
      });
      return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
    }

    const enriched = items.map((s, idx) => ({
      ...s,
      sessionNumber: idx + 1 + skip,
      date: formatDate(s.sessionDate),
      courseName: null,
      instructorName: null,
    }));
    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
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

  /** 列表（下拉选择用，可按 courseId 过滤）。返回 {label,value,...} 形式。 */
  async list(params: { courseId?: number } = {}) {
    const where: any = { isDeleted: 0 };
    if (params.courseId) where.courseId = params.courseId;
    const sessions = await this.sessionRepository.find({
      where,
      order: { sessionDate: 'ASC', startTime: 'ASC' },
    });
    return sessions.map((s) => ({
      label: `${formatDate(s.sessionDate)} ${s.startTime}-${s.endTime}`,
      value: String(s.id),
      id: s.id,
      sessionDate: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
    }));
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
