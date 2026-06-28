import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/coach-schedule-template',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getCoachScheduleTemplatePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function getCoachScheduleTemplateById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

/**
 * 新增排班模板
 * @param data - 请求数据
 */
export function createCoachScheduleTemplate(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

/**
 * 修改排班模板
 * @param id - 修改id值
 * @param data - 请求数据
 */
export function updateCoachScheduleTemplate(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

/**
 * 删除排班模板
 * @param id - 删除id值
 */
export function deleteCoachScheduleTemplate(id: string) {
  return request.delete(`${API.URL}/${id}`);
}

/**
 * 批量生成排班
 * @param data - 生成参数
 */
export function batchGenerateCoachSchedule(data: BaseFormData) {
  return request.post(`${API.URL}/batchGenerate`, data);
}
