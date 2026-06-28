import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/session',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getSessionPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 获取全部列表（下拉选择用）
 * @param params - 筛选参数（如 courseId）
 */
export function getSessionList(params?: BaseFormData) {
  return request.get<BaseFormData[]>(`${API.URL}/list`, { params });
}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function getSessionById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

/**
 * 修改课次信息
 * @param id - 修改id值
 * @param data - 请求数据
 */
export function updateSession(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/${id}`, data);
}

/**
 * 更新课次状态
 * @param id - 课次id
 * @param data - 状态数据
 */
export function updateSessionStatus(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/updateStatus/${id}`, data);
}
