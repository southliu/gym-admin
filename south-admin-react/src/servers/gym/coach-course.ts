import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach-course',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getCoachCoursePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 新增教练课程关联
 * @param data - 请求数据
 */
export function createCoachCourse(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

/**
 * 删除教练课程关联
 * @param id - 删除id值
 */
export function deleteCoachCourse(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
