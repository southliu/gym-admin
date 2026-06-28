import type { TFunction } from 'i18next';
import type { ApiFn } from '#/form';
import type { Constant } from '@/utils/constants';
import { MENU_STATUS, colors } from '@/utils/constants';
import { Button } from 'antd';

// 教练状态（在职/离职/休假）
const COACH_STATUS = (t: TFunction): Constant[] => [
  { label: t('public.open'), value: 1, color: colors.green, type: 'tag' },
  { label: t('public.close'), value: 0, color: colors.red, type: 'tag' },
];

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

// 排班回调类型
type ScheduleViewFn = (coachId: string, coachName: string) => void;

/**
 * 表格数据
 * @param optionRender - 渲染操作函数
 * @param onViewSchedule - 查看排班回调
 */
export const tableColumns = (
  t: TFunction,
  optionRender: TableOptions<object>,
  onViewSchedule?: ScheduleViewFn,
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
      width: 120,
    },
    {
      title: t('gym.phone'),
      dataIndex: 'phone',
      width: 130,
    },
    {
      title: t('gym.specialty'),
      dataIndex: 'specialty',
      width: 150,
      ellipsis: true,
    },
    {
      title: t('system.state'),
      dataIndex: 'status',
      width: 80,
      enum: COACH_STATUS(t),
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
      width: 280,
      fixed: 'right',
      render: (value: unknown, record: object) => (
        <div className="flex flex-wrap gap-5px">
          {optionRender(value, record)}
          {onViewSchedule && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                const row = record as { id: string; name: string };
                onViewSchedule(row.id, row.name);
              }}
            >
              {t('gym.viewSchedule')}
            </Button>
          )}
        </div>
      ),
    },
  ];
};

// 排班模板表格列
export const scheduleColumns = (
  t: TFunction,
  onDeleteSchedule?: (id: string) => void,
): TableColumn[] => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
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
    title: t('public.operate'),
    dataIndex: 'operate',
    width: 100,
    render: (_: unknown, record: object) => {
      const row = record as { id: string };
      return (
        <DeleteBtn
          name={t('gym.scheduleTemplate')}
          handleDelete={() => onDeleteSchedule?.(row.id)}
        />
      );
    },
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
    label: t('gym.phone'),
    name: 'phone',
    rules: FORM_REQUIRED,
    component: 'Input',
  },
  {
    label: t('gym.specialty'),
    name: 'specialty',
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
      options: COACH_STATUS(t),
    },
  },
];

// 添加排班模板表单数据
export const scheduleFormList = (
  t: TFunction,
  courseApiFn: ApiFn,
): BaseFormList[] => [
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
