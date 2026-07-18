import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Coach } from '../entities/coach.entity';
import { Course } from '../entities/course.entity';
import { CourseSession } from '../entities/course-session.entity';
import { CoachScheduleTemplate } from '../entities/coach-schedule-template.entity';
import { CoachScheduleOverride } from '../entities/coach-schedule-override.entity';
import { Booking } from '../entities/booking.entity';
import { CourseType } from '../entities/course-type.entity';
import { Location } from '../entities/location.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * 教练端业务：查看自己的教练档案、负责的课程、排班（模板+例外）、
 * 以及各课次的预约名单。coachId 通过登录账号 user_id 反查 gym_coach 得到。
 */
@Injectable()
export class CoachPortalService {
  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(CoachScheduleTemplate)
    private templateRepository: Repository<CoachScheduleTemplate>,
    @InjectRepository(CoachScheduleOverride)
    private overrideRepository: Repository<CoachScheduleOverride>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(CourseType)
    private courseTypeRepository: Repository<CourseType>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  /** 根据登录账号 userId 反查教练档案。 */
  async getCoachByUserId(userId: number): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { userId, isDeleted: 0 },
    });
    if (!coach) {
      throw new ForbiddenException('当前账号未关联教练档案');
    }
    if (coach.status !== 1) {
      throw new ForbiddenException('教练账号已停用');
    }
    return coach;
  }

  /** 我的教练档案 */
  async profile(userId: number) {
    return this.getCoachByUserId(userId);
  }

  /** 我负责的课程（course.coachId 指向自己，或通过 gym_coach_course 关联） */
  async myCourses(userId: number, dto: PaginationDto) {
    const coach = await this.getCoachByUserId(userId);
    const { page = 1, pageSize = 10 } = dto;
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('course.coachId = :coachId', { coachId: coach.id })
      .orderBy('course.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    // 附带类型、场地名称
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

  /** 我的排班：周循环模板 + 日期例外（请假/加班/换班） */
  async mySchedule(userId: number) {
    const coach = await this.getCoachByUserId(userId);
    const [templates, overrides] = await Promise.all([
      this.templateRepository.find({
        where: { coachId: coach.id, isDeleted: 0 },
        order: { dayOfWeek: 'ASC', startTime: 'ASC' },
      }),
      this.overrideRepository.find({
        where: { coachId: coach.id, isDeleted: 0 },
        order: { overrideDate: 'DESC' },
      }),
    ]);
    return { coach, templates, overrides };
  }

  /** 我的课次（按日期升序），并附每节次的预约人数 */
  async mySessions(userId: number, dto: PaginationDto) {
    const coach = await this.getCoachByUserId(userId);
    const { page = 1, pageSize = 10 } = dto;
    const skip = (page - 1) * pageSize;

    // 先查我负责的课程 id
    const courses = await this.courseRepository.find({
      where: { coachId: coach.id, isDeleted: 0 },
      select: ['id', 'name'],
    });
    const courseIds = courses.map((c) => c.id);
    const courseMap = new Map(courses.map((c) => [c.id, c.name]));

    if (!courseIds.length) {
      return { items: [], page, pageSize, total: 0, totalPages: 0 };
    }

    const [items, total] = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.isDeleted = :isDeleted', { isDeleted: 0 })
      .andWhere('session.courseId IN (:...courseIds)', { courseIds })
      .orderBy('session.sessionDate', 'ASC')
      .addOrderBy('session.startTime', 'ASC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const enriched = items.map((s) => ({
      ...s,
      courseName: courseMap.get(s.courseId) ?? null,
    }));

    return { items: enriched, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
  }

  /** 某节次的预约名单（教练查看自己负责课程的课次） */
  async sessionBookings(userId: number, sessionId: number) {
    const coach = await this.getCoachByUserId(userId);

    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, isDeleted: 0 },
    });
    if (!session) {
      throw new NotFoundException('课次不存在');
    }

    // 鉴权：该课次必须属于教练负责的课程
    const course = await this.courseRepository.findOne({
      where: { id: session.courseId, isDeleted: 0 },
    });
    if (!course || course.coachId !== coach.id) {
      throw new ForbiddenException('无权查看该课次的预约名单');
    }

    const bookings = await this.bookingRepository.find({
      where: { sessionId, isDeleted: 0, status: In([1, 3]) }, // 已预约 / 已签到
      order: { createdAt: 'DESC' },
    });

    return { session, course, bookings };
  }
}
