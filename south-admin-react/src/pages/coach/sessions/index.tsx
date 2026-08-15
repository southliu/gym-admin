import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getCoachSessions, getCoachSessionBookings } from '@/servers/portal';

interface SessionRow {
  id: number;
  courseId: number;
  courseName: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: number;
}

interface BookingRow {
  id: number;
  userId: number;
  status: number;
  remark?: string;
  createdAt: string;
}

const SESSION_STATUS: Record<number, { text: string; color: string }> = {
  1: { text: '正常', color: 'green' },
  2: { text: '已满', color: 'orange' },
  3: { text: '已取消', color: 'red' },
  4: { text: '已结束', color: 'blue' },
};

const BOOKING_STATUS: Record<number, string> = {
  1: '已预约',
  2: '已取消',
  3: '已签到',
};

/** 教练端：我的课次，可查看每节次的预约名单 */
function CoachSessions() {
  const [data, setData] = useState<SessionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [roster, setRoster] = useState<{ open: boolean; session?: SessionRow; bookings: BookingRow[] }>({
    open: false,
    bookings: [],
  });
  const [rosterLoading, setRosterLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res: any = await getCoachSessions({ page, pageSize });
      const payload = res?.data ?? res;
      setData(payload?.items ?? []);
      setTotal(payload?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const openRoster = async (session: SessionRow) => {
    setRosterLoading(true);
    try {
      const res: any = await getCoachSessionBookings(session.id);
      const payload = res?.data ?? res;
      setRoster({ open: true, session, bookings: payload?.bookings ?? [] });
    } finally {
      setRosterLoading(false);
    }
  };

  const columns: ColumnsType<SessionRow> = [
    { title: '课程', dataIndex: 'courseName', render: (v) => v || '-' },
    { title: '日期', dataIndex: 'sessionDate' },
    { title: '开始', dataIndex: 'startTime' },
    { title: '结束', dataIndex: 'endTime' },
    {
      title: '预约',
      render: (_, r) => `${r.bookedCount} / ${r.capacity}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: number) => {
        const m = SESSION_STATUS[s] || { text: '-', color: 'default' };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: '操作',
      render: (_, r) => (
        <Button type="link" onClick={() => openRoster(r)}>
          查看预约名单
        </Button>
      ),
    },
  ];

  const rosterColumns: ColumnsType<BookingRow> = [
    { title: '会员ID', dataIndex: 'userId' },
    { title: '状态', dataIndex: 'status', render: (s) => BOOKING_STATUS[s] ?? '-' },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
    { title: '预约时间', dataIndex: 'createdAt' },
  ];

  return (
    <Card title="我的课次">
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
        title={roster.session ? `预约名单 - ${roster.session.courseName ?? ''} ${roster.session.sessionDate}` : '预约名单'}
        open={roster.open}
        onCancel={() => setRoster({ open: false, bookings: [] })}
        footer={null}
        width={680}
      >
        <Table
          rowKey="id"
          size="small"
          columns={rosterColumns}
          dataSource={roster.bookings}
          loading={rosterLoading}
          pagination={false}
        />
      </Modal>
    </Card>
  );
}

export default CoachSessions;
