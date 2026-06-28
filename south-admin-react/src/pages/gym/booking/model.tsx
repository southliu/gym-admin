import type { TFunction } from 'i18next';
import type { ApiFn } from '#/form';
import type { Constant } from '@/utils/constants';
import { colors } from '@/utils/constants';
import { getCourseList } from '@/servers/gym/course';
import { getUserList } from '@/servers/system/user';

// 预约状态
const BOOKING_STATUS = (t: TFunction): Constant[] => [
  { label: t('gym.booked'), value: 1, color: colors.green, type: 'tag' },
  { label: t('gym.statusCancelled'), value: 2, color: colors.red, type: 'tag' },
  { label: t('gym.completed'), value: 3, color: colors.blue, type: 'tag' },
];

// 搜索数据
export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('gym.user'),
    name: 'userId',
    component: 'ApiSelect',
    componentProps: {
      api: getUserList as ApiFn,
      allowClear: true,
    },
  },
  {
    label: t('system.state'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: BOOKING_STATUS(t),
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
      title: t('gym.user'),
      dataIndex: 'userName',
      width: 120,
    },
    {
      title: t('gym.course'),
      dataIndex: 'courseName',
      width: 150,
    },
    {
      title: t('gym.session'),
      dataIndex: 'sessionName',
      width: 150,
    },
    {
      title: t('system.state'),
      dataIndex: 'status',
      width: 90,
      enum: BOOKING_STATUS(t),
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

// 新增预约表单数据
export const createList = (
  t: TFunction,
  form: any,
  sessionApiFn: ApiFn,
): BaseFormList[] => [
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
  {
    label: t('gym.session'),
    name: 'sessionId',
    rules: FORM_REQUIRED,
    component: 'customize',
    render: (props) => {
      const courseId = form?.getFieldValue('courseId');
      return (
        <ApiSelect
          {...props}
          api={(params?: object) => sessionApiFn({ ...params, courseId })}
          params={courseId ? { courseId } : undefined}
          placeholder={!courseId ? t('gym.pleaseSelectCourseFirst') : t('public.inputPleaseSelect')}
          disabled={!courseId}
        />
      );
    },
  },
  {
    label: t('gym.user'),
    name: 'userId',
    rules: FORM_REQUIRED,
    component: 'ApiSelect',
    componentProps: {
      api: getUserList as ApiFn,
      allowClear: true,
    },
  },
];
