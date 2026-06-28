import type { TFunction } from 'i18next';
import type { ApiFn } from '#/form';
import type { Constant } from '@/utils/constants';
import { getCoachList } from '@/servers/gym/coach';

// 星期选项
const DAY_OF_WEEK_OPTIONS = (t: TFunction): Constant[] => [
  { label: t('gym.monday'), value: 1 },
  { label: t('gym.tuesday'), value: 2 },
  { label: t('gym.wednesday'), value: 3 },
  { label: t('gym.thursday'), value: 4 },
  { label: t('gym.friday'), value: 5 },
  { label: t('gym.saturday'), value: 6 },
  { label: t('gym.sunday'), value: 7 },
];

// 搜索数据
export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.coachName'),
    name: 'coachId',
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      allowClear: true,
    },
  },
  {
    label: t('gym.dayOfWeek'),
    name: 'dayOfWeek',
    component: 'Select',
    componentProps: {
      options: DAY_OF_WEEK_OPTIONS(t),
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
      title: t('gym.dayOfWeek'),
      dataIndex: 'dayOfWeek',
      width: 100,
      enum: DAY_OF_WEEK_OPTIONS(t),
    },
    {
      title: t('gym.startTime'),
      dataIndex: 'startTime',
      width: 100,
    },
    {
      title: t('gym.endTime'),
      dataIndex: 'endTime',
      width: 100,
    },
    {
      title: t('gym.course'),
      dataIndex: 'courseName',
      width: 150,
    },
    {
      title: t('public.creationTime'),
      dataIndex: 'createdAt',
      width: 170,
    },
    {
      title: t('public.updateTime'),
      dataIndex: 'updatedAt',
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

// 新增/编辑表单数据
export const createList = (
  t: TFunction,
  courseApiFn: ApiFn,
): BaseFormList[] => [
  {
    label: t('gym.coachName'),
    name: 'coachId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      allowClear: true,
    },
  },
  {
    label: t('gym.dayOfWeek'),
    name: 'dayOfWeek',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      options: DAY_OF_WEEK_OPTIONS(t),
    },
  },
  {
    label: t('gym.startTime'),
    name: 'startTime',
    rules: FORM_REQUIRED,
    component: 'TimePicker',
    componentProps: {
      style: { width: '100%' },
      format: 'HH:mm',
    },
  },
  {
    label: t('gym.endTime'),
    name: 'endTime',
    rules: FORM_REQUIRED,
    component: 'TimePicker',
    componentProps: {
      style: { width: '100%' },
      format: 'HH:mm',
    },
  },
  {
    label: t('gym.course'),
    name: 'courseId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: courseApiFn,
      allowClear: true,
    },
  },
];

// 批量生成表单数据
export const batchGenerateList = (t: TFunction): BaseFormList[] => [
  {
    label: t('gym.coachName'),
    name: 'coachId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCoachList as ApiFn,
      allowClear: true,
    },
  },
  {
    label: t('gym.dateRange'),
    name: 'dateRange',
    rules: FORM_REQUIRED,
    component: 'RangePicker',
    componentProps: {
      style: { width: '100%' },
    },
  },
];
