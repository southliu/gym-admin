import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

/** 会员端 + 教练端门户接口封装 */

/** 浏览可约课程 */
export function getMemberCourses(data: Partial<{ name: string; typeId: number }> & PaginationData) {
  return request.get<PageServerResult>('/member/courses', { params: data });
}

/** 课程下的课次 */
export function getMemberSessions(courseId: number) {
  return request.get(`/member/courses/${courseId}/sessions`);
}

/** 发起预约 */
export function createMemberBooking(data: { sessionId: number; remark?: string }) {
  return request.post('/member/bookings', data);
}

/** 取消预约 */
export function cancelMemberBooking(id: number) {
  return request.post(`/member/bookings/${id}/cancel`);
}

/** 我的预约 */
export function getMemberBookings(data: Partial<{ status: number }> & PaginationData) {
  return request.get<PageServerResult>('/member/bookings', { params: data });
}

/** 教练档案 */
export function getCoachProfile() {
  return request.get('/coach/profile');
}

/** 我的课程 */
export function getCoachCourses(data: PaginationData) {
  return request.get<PageServerResult>('/coach/courses', { params: data });
}

/** 我的排班 */
export function getCoachSchedule() {
  return request.get('/coach/schedule');
}

/** 我的课次 */
export function getCoachSessions(data: PaginationData) {
  return request.get<PageServerResult>('/coach/sessions', { params: data });
}

/** 课次预约名单 */
export function getCoachSessionBookings(sessionId: number) {
  return request.get(`/coach/sessions/${sessionId}/bookings`);
}
