import type { BaseFormData } from '#/form';
import type { PageServerResult, PaginationData } from '#/public';
import { request } from '@/utils/request';

enum API {
  URL = '/gym/course',
}

/**
 * 获取分页数据
 * @param data - 请求数据
 */
export function getCoursePage(data: Partial<BaseFormData> & PaginationData) {
  return request.get<PageServerResult<BaseFormData[]>>(`${API.URL}/page`, { params: data });
}

/**
 * 获取全部列表（下拉选择用）
 * @param params - 筛选参数
 */
export function getCourseList(params?: BaseFormData) {
  return request.get<BaseFormData[]>(`${API.URL}/list`, { params });
}

/**
 * 根据ID获取数据
 * @param id - ID
 */
export function getCourseById(id: string) {
  return request.get<BaseFormData>(`${API.URL}/detail?id=${id}`);
}

/**
 * 新增数据
 * @param data - 请求数据
 */
export function createCourse(data: BaseFormData) {
  return request.post(`${API.URL}/create`, data);
}

/**
 * 修改数据
 * @param id - 修改id值
 * @param data - 请求数据
 */
export function updateCourse(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/update/${id}`, data);
}

/**
 * 更新课程状态
 * @param id - 课程id
 * @param data - 状态数据
 */
export function updateCourseStatus(id: string, data: BaseFormData) {
  return request.put(`${API.URL}/updateStatus/${id}`, data);
}

/**
 * 删除
 * @param id - 删除id值
 */
export function deleteCourse(id: string) {
  return request.delete(`${API.URL}/${id}`);
}

/**
 * 获取课程统计
 */
export function getCourseStats() {
  return request.get<BaseFormData>(`${API.URL}/stats`);
}
