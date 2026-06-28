import type { TFunction } from 'i18next';
import { MENU_STATUS } from '@/utils/constants';

// 搜索数据
export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('public.name'),
    name: 'name',
    component: 'Input',
  },
  {
    label: t('system.state'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: MENU_STATUS(t),
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
      title: t('public.name'),
      dataIndex: 'name',
      width: 150,
    },
    {
      title: t('public.content'),
      dataIndex: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('system.state'),
      dataIndex: 'status',
      width: 80,
      enum: MENU_STATUS(t),
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

// 新增数据
export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('public.name'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('public.content'),
    name: 'description',
    component: 'TextArea',
  },
  {
    label: t('system.state'),
    name: 'status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      options: MENU_STATUS(t),
    },
  },
];
