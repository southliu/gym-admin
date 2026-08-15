import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../system/entities/user.entity';
import { Role } from '../system/entities/role.entity';
import { Course } from '../gym/entities/course.entity';
import { CourseSession } from '../gym/entities/course-session.entity';
import { Booking } from '../gym/entities/booking.entity';
import { Coach } from '../gym/entities/coach.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseSession)
    private sessionRepository: Repository<CourseSession>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
  ) {}

  async getStatistics() {
    // 会员总数：拥有 member/会员 角色的用户
    const memberRole = await this.roleRepository.findOne({
      where: [
        { name: 'member' },
        { name: '会员' },
        { description: '会员' },
      ],
    });

    let totalMembers = 0;
    if (memberRole) {
      totalMembers = await this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role', 'role.id = :roleId', { roleId: memberRole.id })
        .where('user.isDeleted = 0 AND user.status = 1')
        .getCount();
    }

    // 课程总数
    const totalCourses = await this.courseRepository.count({
      where: { isDeleted: 0 },
    });

    // 课次总数
    const totalSessions = await this.sessionRepository.count({
      where: { isDeleted: 0 },
    });

    // 活跃预约数（已预约状态）
    const totalBookings = await this.bookingRepository.count({
      where: { isDeleted: 0, status: 1 },
    });

    // 教练总数
    const totalCoaches = await this.coachRepository.count({
      where: { isDeleted: 0 },
    });

    // 热门课程 Top 5（按预约数排序）
    const topCourses = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.courseId', 'courseId')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .leftJoin(
        Booking,
        'booking',
        'booking.sessionId = session.id AND booking.status = 1 AND booking.isDeleted = 0',
      )
      .innerJoin(Course, 'course', 'course.id = session.courseId AND course.isDeleted = 0')
      .where('session.isDeleted = :isDeleted', { isDeleted: 0 })
      .groupBy('session.courseId')
      .orderBy('bookingCount', 'DESC')
      .limit(5)
      .getRawMany();

    // 获取热门课程的名称
    const courseIds = topCourses.map((c) => c.courseId);
    const courseMap = new Map<number, string>();
    if (courseIds.length > 0) {
      const courses = await this.courseRepository.find({
        where: { id: In(courseIds.map(Number)), isDeleted: 0 },
        select: ['id', 'name'],
      });
      courses.forEach((c) => courseMap.set(Number(c.id), c.name));
    }

    const topCoursesWithName = topCourses.map((c) => ({
      courseId: Number(c.courseId),
      courseName: courseMap.get(Number(c.courseId)) || '未知课程',
      bookingCount: Number(c.bookingCount),
    }));

    // 近 7 天每日预约趋势
    const dailyBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("DATE_FORMAT(booking.createdAt, '%Y-%m-%d')", 'date')
      .addSelect('COUNT(booking.id)', 'count')
      .where('booking.isDeleted = 0 AND booking.status = 1')
      .andWhere('booking.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)')
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      totalMembers,
      totalCourses,
      totalSessions,
      totalBookings,
      totalCoaches,
      topCourses: topCoursesWithName,
      dailyBookings: dailyBookings.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
    };
  }
}
