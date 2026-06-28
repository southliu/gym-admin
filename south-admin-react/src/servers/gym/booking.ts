import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/booking',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getBookingPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function getBookingById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

/**
 * 新增预约
 * @param data - 请求数据
 */
export function createBooking(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

/**
 * 取消预约
 * @param id - 预约id值
 */
export function cancelBooking(id: string) {
  return request.put(`${API.URL}/cancel/${id}`);
}

/**
 * 删除预约
 * @param id - 删除id值
 */
export function deleteBooking(id: string) {
  return request.delete(`${API.URL}/${id}`);
}
