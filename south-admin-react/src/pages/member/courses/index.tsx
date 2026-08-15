import { useEffect, useState } from 'react';
import { Card, Table, Input, Button, Modal, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getMemberCourses, getMemberSessions, createMemberBooking } from '@/servers/portal';

interface CourseRow {
  id: number;
  name: string;
  typeName: string | null;
  locationName: string | null;
  capacity: number;
  description?: string;
}

interface SessionRow {
  id: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: number;
}

const STATUS_MAP: Record<number, { text: string; color: string }> = {
  1: { text: '可预约', color: 'green' },
  2: { text: '已满', color: 'red' },
  3: { text: '已取消', color: 'default' },
  4: { text: '已结束', color: 'blue' },
};

/** 会员端：浏览可约课程，查看课次并发起预约 */
function MemberCourses() {
  const [data, setData] = useState<CourseRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const [sessionModal, setSessionModal] = useState<{ open: boolean; course?: CourseRow; sessions: SessionRow[] }>({
    open: false,
    sessions: [],
  });
  const [sessionLoading, setSessionLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await getMemberCourses({ page, pageSize, name: keyword || undefined });
      const payload = res?.data ?? res;
      setData(payload?.items ?? []);
      setTotal(payload?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const openSessions = async (course: CourseRow) => {
    setSessionLoading(true);
    try {
      const res: any = await getMemberSessions(course.id);
      const payload = res?.data ?? res;
      setSessionModal({ open: true, course, sessions: payload?.sessions ?? [] });
    } finally {
      setSessionLoading(false);
    }
  };

  const book = async (sessionId: number) => {
    try {
      await createMemberBooking({ sessionId });
      messageApi.success('预约成功');
      // 刷新课次余量
      if (sessionModal.course) {
        const res: any = await getMemberSessions(sessionModal.course.id);
        const payload = res?.data ?? res;
        setSessionModal({ open: true, course: sessionModal.course, sessions: payload?.sessions ?? [] });
      }
    } catch (e: any) {
      messageApi.error(e?.message || '预约失败');
    }
  };

  const columns: ColumnsType<CourseRow> = [
    { title: '课程名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'typeName', render: (v) => v || '-' },
    { title: '场地', dataIndex: 'locationName', render: (v) => v || '-' },
    { title: '容量', dataIndex: 'capacity' },
    {
      title: '操作',
      render: (_, record) => (
        <Button type="link" onClick={() => openSessions(record)}>
          查看课次并预约
        </Button>
      ),
    },
  ];

  const sessionColumns: ColumnsType<SessionRow> = [
    { title: '日期', dataIndex: 'sessionDate' },
    { title: '开始', dataIndex: 'startTime' },
    { title: '结束', dataIndex: 'endTime' },
    {
      title: '余量',
      render: (_, r) => `${r.capacity - r.bookedCount} / ${r.capacity}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: number) => {
        const m = STATUS_MAP[s] || { text: '-', color: 'default' };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: '操作',
      render: (_, r) => (
        <Button type="link" disabled={r.status !== 1} onClick={() => book(r.id)}>
          预约
        </Button>
      ),
    },
  ];

  return (
    <Card title="浏览课程">
      {contextHolder}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input.Search
          placeholder="课程名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={() => {
            setPage(1);
            fetchData();
          }}
          style={{ width: 240 }}
        />
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />
      <Modal
        title={sessionModal.course ? `课次 - ${sessionModal.course.name}` : '课次'}
        open={sessionModal.open}
        onCancel={() => setSessionModal({ open: false, sessions: [] })}
        footer={null}
        width={720}
      >
        <Table
          rowKey="id"
          size="small"
          columns={sessionColumns}
          dataSource={sessionModal.sessions}
          loading={sessionLoading}
          pagination={false}
        />
      </Modal>
    </Card>
  );
}

export default MemberCourses;
