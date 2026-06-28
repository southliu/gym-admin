import type { TFunction } from 'i18next';
import type { ApiFn } from '#/form';
import type { Constant } from '@/utils/constants';
import { colors } from '@/utils/constants';
import { getCoachList } from '@/servers/gym/coach';

// 排班覆盖类型
const OVERRIDE_TYPE = (t: TFunction): Constant[] => [
  { label: t('gym.overrideLeave'), value: 1, color: colors.red, type: 'tag' },
  { label: t('gym.overrideOvertime'), value: 2, color: colors.blue, type: 'tag' },
  { label: t('gym.overrideShiftChange'), value: 3, color: colors.orange, type: 'tag' },
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
    label: t('gym.overrideType'),
    name: 'type',
    component: 'Select',
    componentProps: {
      options: OVERRIDE_TYPE(t),
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
      title: t('gym.date'),
      dataIndex: 'date',
      width: 120,
    },
    {
      title: t('gym.overrideType'),
      dataIndex: 'type',
      width: 100,
      enum: OVERRIDE_TYPE(t),
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
      title: t('gym.reason'),
      dataIndex: 'reason',
      width: 200,
      ellipsis: true,
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
export const createList = (t: TFunction): BaseFormList[] => [
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
    label: t('gym.date'),
    name: 'date',
    rules: FORM_REQUIRED,
    component: 'DatePicker',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    label: t('gym.overrideType'),
    name: 'type',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      options: OVERRIDE_TYPE(t),
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
    label: t('gym.reason'),
    name: 'reason',
    component: 'TextArea',
  },
];
