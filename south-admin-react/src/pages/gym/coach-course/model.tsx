import type { TFunction } from 'i18next';
import type { ApiFn } from '#/form';
import { getCoachList } from '@/servers/gym/coach';
import { getCourseList } from '@/servers/gym/course';

// 搜索数据
export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.coach'),
    name: 'coachId',
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      allowClear: true,
    },
  },
  {
    label: t('gym.course'),
    name: 'courseId',
    component: 'ApiSelect',
    componentProps: {
      api: getCourseList as ApiFn,
      allowClear: true,
    },
  },
];

/**
 * 表格数据
 * @param optionRender - 渲染操作函数
 */
export const tableColumns = (t: TFunction, optionRender: TableOptions<object>): TableColumn[] => {
  return [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: t('gym.coachName'),
      dataIndex: 'coachName',
      width: 120,
    },
    {
      title: t('gym.courseName'),
      dataIndex: 'courseName',
      width: 150,
    },
    {
      title: t('gym.assignmentTime'),
      dataIndex: 'createdAt',
      width: 170,
    },
    {
      title: t('public.operate'),
      dataIndex: 'operate',
      width: 200,
      fixed: 'right',
      render: (value: unknown, record: object) => optionRender(value, record),
    },
  ];
};

// 新增表单数据
export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.coach'),
    name: 'coachId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      allowClear: true,
    },
  },
  {
    label: t('gym.course'),
    name: 'courseId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCourseList as ApiFn,
      allowClear: true,
      params: { status: 1 },
    },
  },
];
