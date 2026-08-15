import { request } from '@/utils/request';

export interface DashboardStats {
  totalMembers: number;
  totalCourses: number;
  totalSessions: number;
  totalBookings: number;
  totalCoaches: number;
  topCourses: { courseId: number; courseName: string; bookingCount: number }[];
  dailyBookings: { date: string; count: number }[];
}

/**
 * 获取仪表盘统计数据
 */
export function getDashboardData() {
  return request.get<DashboardStats>('/dashboard/list');
}
