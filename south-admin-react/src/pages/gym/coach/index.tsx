import type { Key, TableRowSelection } from 'antd/es/table/interface';
import type { FormInstance } from 'antd';
import { Button, Drawer, Form, Table, message } from 'antd';
import { useMemo, useCallback } from 'react';
import { useEffectOnActive } from 'keepalive-for-react';
import type { ApiFn } from '#/form';
import {
  createList,
  scheduleColumns,
  scheduleFormList,
  searchList,
  tableColumns,
} from './model';
import {
  createCoach,
  deleteCoach,
  getCoachById,
  getCoachPage,
  updateCoach,
} from '@/servers/gym/coach';
import {
  createCoachScheduleTemplate,
  deleteCoachScheduleTemplate,
  getCoachScheduleTemplatePage,
} from '@/servers/gym/coach-schedule-template';
import { getCourseList } from '@/servers/gym/course';

// 当前行数据
interface RowData {
  id: string;
  name: string;
}

// 初始化新增数据
const initCreate = {
  status: 1,
};

function Page() {
  const { t } = useTranslation();
  const createFormRef = useRef<FormInstance>(null);
  const scheduleFormRef = useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState(ADD_TITLE(t));
  const [createId, setCreateId] = useState('');
  const [createData, setCreateData] = useState<BaseFormData>(initCreate);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<BaseFormData[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [handleSetSearchParams] = useSearchUrlParams(searchForm);

  // 排班抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCoachName, setDrawerCoachName] = useState('');
  const [drawerCoachId, setDrawerCoachId] = useState('');
  const [scheduleData, setScheduleData] = useState<BaseFormData[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedulePage, setSchedulePage] = useState(INIT_PAGINATION.page);
  const [schedulePageSize, setSchedulePageSize] = useState(INIT_PAGINATION.pageSize);
  const [scheduleTotal, setScheduleTotal] = useState(0);
  const [isScheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [isScheduleFormLoading, setScheduleFormLoading] = useState(false);

  const { permissions } = useCommonStore();

  // 权限前缀
  const permissionPrefix = '/gym/coach';

  // 权限
  const pagePermission: PagePermission = {
    page: checkPermission(permissionPrefix, permissions),
    create: checkPermission(`${permissionPrefix}/create`, permissions),
    update: checkPermission(`${permissionPrefix}/update`, permissions),
    delete: checkPermission(`${permissionPrefix}/delete`, permissions),
    viewSchedule: checkPermission(`${permissionPrefix}/schedule`, permissions),
  };

  /** 获取表格数据 */
  const getPage = useCallback(async () => {
    const params = { ...searchData, page, pageSize };

    try {
      setLoading(true);
      const { code, data } = await getCoachPage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  /** 获取排班模板数据 */
  const getScheduleData = useCallback(async (coachId: string) => {
    try {
      setScheduleLoading(true);
      const { code, data } = await getCoachScheduleTemplatePage({
        coachId,
        page: schedulePage,
        pageSize: schedulePageSize,
      });
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setScheduleTotal(total || 0);
      setScheduleData(items || []);
    } finally {
      setScheduleLoading(false);
    }
  }, [schedulePage, schedulePageSize]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [getPage, isFetch]);

  // 首次进入自动加载接口数据
  useEffect(() => {
    if (pagePermission.page) getPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagePermission.page]);

  // 每次进入调用
  useEffectOnActive(() => {
    getPage();
  }, []);

  /**
   * 点击搜索
   * @param values - 表单返回数据
   */
  const onSearch = (values: BaseFormData) => {
    setPage(1);
    setSearchData(values);
    handleSetSearchParams(values);
    setFetch(true);
  };

  /** 点击新增 */
  const onCreate = () => {
    setCreateOpen(true);
    setCreateTitle(ADD_TITLE(t));
    setCreateId('');
    setCreateData(initCreate);
  };

  /**
   * 点击编辑
   * @param id - 唯一值
   */
  const onUpdate = async (id: string) => {
    try {
      setCreateOpen(true);
      setCreateTitle(EDIT_TITLE(t, id));
      setCreateId(id);
      setCreateLoading(true);
      const { code, data } = await getCoachById(id);
      if (Number(code) !== 200) return;
      setCreateData(data);
    } finally {
      setCreateLoading(false);
    }
  };

  /** 表格提交 */
  const createSubmit = () => {
    createFormRef.current?.submit();
  };

  /** 关闭新增/修改弹窗 */
  const closeCreate = () => {
    setCreateOpen(false);
  };

  /**
   * 新增/编辑提交
   * @param values - 表单返回数据
   */
  const handleCreate = async (values: BaseFormData) => {
    try {
      setCreateLoading(true);
      const functions = () =>
        createId ? updateCoach(createId, values) : createCoach(values);
      const { code, message } = await functions();
      if (Number(code) !== 200) return;
      messageApi.success(message || t('public.successfulOperation'));
      setCreateOpen(false);
      getPage();
    } finally {
      setCreateLoading(false);
    }
  };

  /**
   * 点击删除
   * @param id - 唯一值
   */
  const onDelete = async (id: string) => {
    try {
      setLoading(true);
      const { code, message } = await deleteCoach(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getPage();
      }
    } finally {
      setLoading(false);
    }
  };

  /** 处理批量删除 */
  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) {
      return messageApi.warning({
        content: t('public.tableSelectWarning'),
        key: 'pleaseSelect',
      });
    }
    // 需要后端支持批量删除接口
  };

  /**
   * 处理分页
   * @param page - 当前页数
   * @param pageSize - 每页条数
   */
  const onChangePagination = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  };

  /**
   * 监听表格多选变化
   * @param newSelectedRowKeys - 勾选值
   */
  const onSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  /** 表格多选  */
  const rowSelection: TableRowSelection<object> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  /**
   * 渲染操作
   * @param _ - 当前值
   * @param record - 当前行参数
   */
  const optionRender = useCallback(
    (_: unknown, record: object) => {
      return (
        <div className="flex flex-wrap gap-5px">
          {pagePermission.update === true && (
            <UpdateBtn onClick={() => onUpdate((record as RowData).id)} />
          )}
          {pagePermission.delete === true && (
            <DeleteBtn
              name={(record as RowData).name}
              handleDelete={() => onDelete((record as RowData).id)}
            />
          )}
        </div>
      );
    },
    [pagePermission.update, pagePermission.delete, onUpdate, onDelete],
  );

  /** 打开排班抽屉 */
  const onOpenScheduleDrawer = (coachId: string, coachName: string) => {
    setDrawerOpen(true);
    setDrawerCoachId(coachId);
    setDrawerCoachName(coachName);
    setSchedulePage(1);
    setSchedulePageSize(INIT_PAGINATION.pageSize);
  };

  /** 查看排班回调（含权限检查） */
  const handleViewSchedule = useCallback(
    (coachId: string, coachName: string) => {
      if (pagePermission.viewSchedule === true) {
        onOpenScheduleDrawer(coachId, coachName);
      }
    },
    [pagePermission.viewSchedule, onOpenScheduleDrawer],
  );

  // 缓存列配置
  const columns = useMemo(
    () => tableColumns(t, optionRender, handleViewSchedule),
    [t, optionRender, handleViewSchedule],
  );

  /** 左侧渲染 */
  const leftContentRender = (
    <DeleteBtn
      isIcon
      isLoading={isLoading}
      btnType="batchDelete"
      handleDelete={handleBatchDelete}
    />
  );

  /** 关闭排班抽屉 */
  const onCloseScheduleDrawer = () => {
    setDrawerOpen(false);
  };

  /** 打开添加排班模板表单 */
  const onOpenScheduleForm = () => {
    setScheduleFormOpen(true);
  };

  /** 关闭添加排班模板表单 */
  const onCloseScheduleForm = () => {
    setScheduleFormOpen(false);
    scheduleFormRef.current?.resetFields();
  };

  /** 提交添加排班模板 */
  const scheduleFormSubmit = () => {
    scheduleFormRef.current?.submit();
  };

  /** 处理添加排班模板 */
  const handleCreateSchedule = async (values: BaseFormData) => {
    try {
      setScheduleFormLoading(true);
      const params = {
        ...values,
        coachId: drawerCoachId,
        startTime: (values.startTime as unknown as { format: (fmt: string) => string })?.format?.('HH:mm') || values.startTime,
        endTime: (values.endTime as unknown as { format: (fmt: string) => string })?.format?.('HH:mm') || values.endTime,
      };
      const { code, message } = await createCoachScheduleTemplate(params);
      if (Number(code) !== 200) return;
      messageApi.success(message || t('public.successfulOperation'));
      setScheduleFormOpen(false);
      scheduleFormRef.current?.resetFields();
      getScheduleData(drawerCoachId);
    } finally {
      setScheduleFormLoading(false);
    }
  };

  /** 处理删除排班模板 */
  const onDeleteSchedule = async (id: string) => {
    try {
      setScheduleLoading(true);
      const { code, message } = await deleteCoachScheduleTemplate(id);
      if (Number(code) === 200) {
        messageApi.success(message || t('public.successfullyDeleted'));
        getScheduleData(drawerCoachId);
      }
    } finally {
      setScheduleLoading(false);
    }
  };

  /** 排班模板分页变更 */
  const onSchedulePageChange = (newPage: number, newPageSize: number) => {
    setSchedulePage(newPage);
    setSchedulePageSize(newPageSize);
  };

  // 排班分页变化后重新获取数据
  useEffect(() => {
    if (drawerOpen && drawerCoachId) {
      getScheduleData(drawerCoachId);
    }
  }, [drawerOpen, drawerCoachId, schedulePage, schedulePageSize, getScheduleData]);

  // 缓存排班模板列配置
  const scheduleTableColumns = useMemo(
    () => scheduleColumns(t, onDeleteSchedule),
    [t, onDeleteSchedule],
  );

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(t)}
          searchForm={searchForm}
          data={searchData}
          type="grid"
          isLoading={isLoading}
          handleFinish={onSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <BaseTable
          isLoading={isLoading}
          isCreate={pagePermission.create}
          columns={columns}
          dataSource={tableData}
          rowSelection={rowSelection}
          leftContent={leftContentRender}
          getPage={getPage}
          onCreate={onCreate}
        />

        <BasePagination
          disabled={isLoading}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onChangePagination}
        />
      </BaseCard>

      <BaseModal
        title={createTitle}
        open={isCreateOpen}
        confirmLoading={isCreateLoading}
        onOk={createSubmit}
        onCancel={closeCreate}
      >
        <BaseForm
          form={form}
          ref={createFormRef}
          list={createList(t)}
          labelCol={{ span: 4 }}
          data={createData}
          handleFinish={handleCreate}
        />
      </BaseModal>

      {/* 排班抽屉 */}
      <Drawer
        title={`${t('gym.scheduleManage')} - ${drawerCoachName}`}
        open={drawerOpen}
        onClose={onCloseScheduleDrawer}
        width={720}
        extra={
          pagePermission.viewSchedule === true && (
            <Button type="primary" onClick={onOpenScheduleForm}>
              {t('gym.addScheduleTemplate')}
            </Button>
          )
        }
      >
        <Table
          rowKey="id"
          columns={scheduleTableColumns}
          dataSource={scheduleData}
          loading={scheduleLoading}
          pagination={{
            current: schedulePage,
            pageSize: schedulePageSize,
            total: scheduleTotal,
            onChange: onSchedulePageChange,
            showSizeChanger: true,
            showTotal: (total) => t('public.totalNum', { num: total }),
          }}
        />
      </Drawer>

      {/* 添加排班模板弹窗 */}
      <BaseModal
        title={t('gym.addScheduleTemplate')}
        open={isScheduleFormOpen}
        confirmLoading={isScheduleFormLoading}
        onOk={scheduleFormSubmit}
        onCancel={onCloseScheduleForm}
      >
        <BaseForm
          form={form}
          ref={scheduleFormRef}
          list={scheduleFormList(t, getCourseList as ApiFn)}
          labelCol={{ span: 5 }}
          data={{}}
          handleFinish={handleCreateSchedule}
        />
      </BaseModal>
    </BaseContent>
  );
}

export default Page;
