import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/location',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getLocationPage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 获取全部列表（下拉选择用）
 */
export function getLocationList() {
  return request.get<BaseFormData[]>(`${API.URL}/list`);
}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function getLocationById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

/**
 * 新增数据
 * @param data - 请求数据
 */
export function createLocation(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

/**
 * 修改数据
 * @param id - 修改id值
 * @param data - 请求数据
 */
export function updateLocation(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

/**
 * 删除
 * @param id - 删除id值
 */
export function deleteLocation(id: string) {
  return request.delete(`${API.URL}/${id}`);
}

/**
 * 批量删除
 * @param data - 请求数据
 */
export function batchDeleteLocation(data: BaseFormData) {
  return request.post(`${API.URL}/batchDelete`, data);
}
