import type { Key, TableRowSelection } from 'antd/es/table/interface';
import type { FormInstance } from 'antd';
import { Drawer, Form, Table, message } from 'antd';
import { useMemo, useCallback } from 'react';
import { useEffectOnActive } from 'keepalive-for-react';
import { createList, searchList, sessionColumns, tableColumns } from './model';
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCoursePage,
  updateCourse,
} from '@/servers/gym/course';
import { getSessionPage } from '@/servers/gym/session';

// 当前行数据
interface RowData {
  id: string;
  name: string;
}

// 初始化新增数据
const initCreate = {
  status: 'open',
};

function Page() {
  const { t } = useTranslation();
  const createFormRef = useRef<FormInstance>(null);
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

  // 课次抽屉状态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCourseName, setDrawerCourseName] = useState('');
  const [drawerCourseId, setDrawerCourseId] = useState('');
  const [sessionData, setSessionData] = useState<BaseFormData[]>([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionPage, setSessionPage] = useState(INIT_PAGINATION.page);
  const [sessionPageSize, setSessionPageSize] = useState(INIT_PAGINATION.pageSize);
  const [sessionTotal, setSessionTotal] = useState(0);

  const { permissions } = useCommonStore();

  // 权限前缀
  const permissionPrefix = '/gym/course';

  // 权限
  const pagePermission: PagePermission = {
    page: checkPermission(permissionPrefix, permissions),
    create: checkPermission(`${permissionPrefix}/create`, permissions),
    update: checkPermission(`${permissionPrefix}/update`, permissions),
    delete: checkPermission(`${permissionPrefix}/delete`, permissions),
    viewSession: checkPermission(`${permissionPrefix}/session`, permissions),
  };

  /** 获取表格数据 */
  const getPage = useCallback(async () => {
    const params = { ...searchData, page, pageSize };

    try {
      setLoading(true);
      const { code, data } = await getCoursePage(params);
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setTotal(total || 0);
      setTableData(items || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  /** 获取课次数据 */
  const getSessionData = useCallback(async (courseId: string) => {
    try {
      setSessionLoading(true);
      const { code, data } = await getSessionPage({
        courseId,
        page: sessionPage,
        pageSize: sessionPageSize,
      });
      if (Number(code) !== 200) return;
      const { items, total } = data;
      setSessionTotal(total || 0);
      setSessionData(items || []);
    } finally {
      setSessionLoading(false);
    }
  }, [sessionPage, sessionPageSize]);

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
      const { code, data } = await getCourseById(id);
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
        createId ? updateCourse(createId, values) : createCourse(values);
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
      const { code, message } = await deleteCourse(id);
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

  /** 打开课次抽屉 */
  const onOpenSessionDrawer = (courseId: string, courseName: string) => {
    setDrawerOpen(true);
    setDrawerCourseId(courseId);
    setDrawerCourseName(courseName);
    setSessionPage(1);
    setSessionPageSize(INIT_PAGINATION.pageSize);
  };

  /** 查看课次回调（含权限检查） */
  const handleViewSession = useCallback(
    (courseId: string, courseName: string) => {
      if (pagePermission.viewSession === true) {
        onOpenSessionDrawer(courseId, courseName);
      }
    },
    [pagePermission.viewSession, onOpenSessionDrawer],
  );

  // 缓存列配置
  const columns = useMemo(
    () => tableColumns(t, optionRender, handleViewSession),
    [t, optionRender, handleViewSession],
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

  /** 关闭课次抽屉 */
  const onCloseSessionDrawer = () => {
    setDrawerOpen(false);
  };

  /** 课次分页变更 */
  const onSessionPageChange = (newPage: number, newPageSize: number) => {
    setSessionPage(newPage);
    setSessionPageSize(newPageSize);
  };

  // 课次分页变化后重新获取数据
  useEffect(() => {
    if (drawerOpen && drawerCourseId) {
      getSessionData(drawerCourseId);
    }
  }, [drawerOpen, drawerCourseId, sessionPage, sessionPageSize, getSessionData]);

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

      {/* 课次抽屉 */}
      <Drawer
        title={`${t('gym.sessionManage')} - ${drawerCourseName}`}
        open={drawerOpen}
        onClose={onCloseSessionDrawer}
        width={720}
      >
        <Table
          rowKey="id"
          columns={sessionColumns(t)}
          dataSource={sessionData}
          loading={sessionLoading}
          pagination={{
            current: sessionPage,
            pageSize: sessionPageSize,
            total: sessionTotal,
            onChange: onSessionPageChange,
            showSizeChanger: true,
            showTotal: (total) => t('public.totalNum', { num: total }),
          }}
        />
      </Drawer>
    </BaseContent>
  );
}

export default Page;
