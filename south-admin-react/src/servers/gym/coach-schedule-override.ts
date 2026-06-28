import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach-schedule-override',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getCoachScheduleOverridePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function getCoachScheduleOverrideById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

/**
 * 新增排班覆盖
 * @param data - 请求数据
 */
export function createCoachScheduleOverride(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

/**
 * 修改排班覆盖
 * @param id - 修改id值
 * @param data - 请求数据
 */
export function updateCoachScheduleOverride(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

/**
 * 删除排班覆盖
 * @param id - 删除id值
 */
export function deleteCoachScheduleOverride(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
