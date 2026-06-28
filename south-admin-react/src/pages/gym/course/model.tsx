import type { TFunction } from 'i18next';
import { Button } from 'antd';
import { getCourseTypeList } from '@/servers/gym/course-type';
import { getLocationList } from '@/servers/gym/location';
import type { Constant } from '@/utils/constants';
import { colors } from '@/utils/constants';

// 课程状态（开放/已满/已取消/已结束）
const COURSE_STATUS = (t: TFunction): Constant[] => [
  { label: t('gym.statusOpen'), value: 1, color: colors.green, type: 'tag' },
  { label: t('gym.statusFull'), value: 2, color: colors.orange, type: 'tag' },
  { label: t('gym.statusCancelled'), value: 3, color: colors.red, type: 'tag' },
  { label: t('gym.statusEnded'), value: 4, color: colors.info, type: 'tag' },
];

// 搜索数据
export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('public.name'),
    name: 'name',
    component: 'Input',
  },
  {
    label: t('public.type'),
    name: 'courseTypeId',
    component: 'ApiSelect',
    componentProps: {
      api: getCourseTypeList,
      allowClear: true,
    },
  },
  {
    label: t('system.state'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: COURSE_STATUS(t),
      allowClear: true,
    },
  },
];

// 课次按钮回调类型
type SessionViewFn = (courseId: string, courseName: string) => void;

/**
 * 表格数据
 * @param optionRender - 渲染操作函数
 * @param onViewSession - 查看课次回调
 */
export const tableColumns = (
  t: TFunction,
  optionRender: TableOptions<object>,
  onViewSession?: SessionViewFn,
): TableColumn[] => {
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
      title: t('public.type'),
      dataIndex: 'courseTypeName',
      width: 120,
    },
    {
      title: t('gym.location'),
      dataIndex: 'locationName',
      width: 120,
    },
    {
      title: t('gym.startDate'),
      dataIndex: 'startDate',
      width: 120,
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
      title: t('public.capacity'),
      dataIndex: 'capacity',
      width: 80,
    },
    {
      title: t('gym.bookedCount'),
      dataIndex: 'bookedCount',
      width: 80,
    },
    {
      title: t('system.state'),
      dataIndex: 'status',
      width: 90,
      enum: COURSE_STATUS(t),
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
      width: 250,
      fixed: 'right',
      render: (value: unknown, record: object) => (
        <div className="flex flex-wrap gap-5px">
          {optionRender(value, record)}
          {onViewSession && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                const row = record as { id: string; name: string };
                onViewSession(row.id, row.name);
              }}
            >
              {t('gym.viewSessions')}
            </Button>
          )}
        </div>
      ),
    },
  ];
};

// 课次表格列
export const sessionColumns = (t: TFunction): TableColumn[] => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: t('gym.session'),
    dataIndex: 'sessionNumber',
    width: 80,
  },
  {
    title: t('gym.date'),
    dataIndex: 'date',
    width: 120,
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
    title: t('gym.instructor'),
    dataIndex: 'instructorName',
    width: 100,
  },
  {
    title: t('public.capacity'),
    dataIndex: 'capacity',
    width: 80,
  },
  {
    title: t('system.state'),
    dataIndex: 'status',
    width: 90,
    enum: COURSE_STATUS(t),
  },
];

// 新增/编辑表单数据
export const createList = (t: TFunction): BaseFormList[] => [
  {
    label: t('public.name'),
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('public.type'),
    name: 'courseTypeId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getCourseTypeList,
      allowClear: true,
    },
  },
  {
    label: t('gym.location'),
    name: 'locationId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getLocationList,
      allowClear: true,
    },
  },
  {
    label: t('gym.startDate'),
    name: 'startDate',
    rules: FORM_REQUIRED,
    component: 'DatePicker',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    label: t('gym.startTime'),
    name: 'startTime',
    rules: FORM_REQUIRED,
    component: 'TimePicker',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    label: t('gym.endTime'),
    name: 'endTime',
    rules: FORM_REQUIRED,
    component: 'TimePicker',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    label: t('public.capacity'),
    name: 'capacity',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
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
      options: COURSE_STATUS(t),
    },
  },
];
