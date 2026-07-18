import { useEffect, useState } from 'react';
import { Card, Table, Button, Segmented, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getMemberBookings, cancelMemberBooking } from '@/servers/portal';

interface BookingRow {
  id: number;
  sessionId: number;
  status: number;
  remark?: string;
  createdAt: string;
  session?: {
    id: number;
    sessionDate: string;
    startTime: string;
    endTime: string;
    courseName: string | null;
  } | null;
}

const STATUS_TEXT: Record<number, string> = {
  1: '已预约',
  2: '已取消',
  3: '已签到',
};

/** 会员端：我的预约，支持按状态筛选并取消未开始的预约 */
function MemberBookings() {
  const [data, setData] = useState<BookingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('1');
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await getMemberBookings({
        page,
        pageSize,
        status: statusFilter === 'all' ? undefined : Number(statusFilter),
      });
      setData(res?.items ?? []);
      setTotal(res?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, statusFilter]);

  const onCancel = async (id: number) => {
    try {
      await cancelMemberBooking(id);
      messageApi.success('已取消');
      fetchData();
    } catch (e: any) {
      messageApi.error(e?.message || '取消失败');
    }
  };

  const columns: ColumnsType<BookingRow> = [
    {
      title: '课程',
      render: (_, r) => r.session?.courseName ?? '-',
    },
    {
      title: '上课时间',
      render: (_, r) =>
        r.session ? `${r.session.sessionDate} ${r.session.startTime}-${r.session.endTime}` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: number) => STATUS_TEXT[s] ?? '-',
    },
    { title: '备注', dataIndex: 'remark', render: (v) => v || '-' },
    { title: '预约时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      render: (_, r) =>
        r.status === 1 ? (
          <Button type="link" danger onClick={() => onCancel(r.id)}>
            取消预约
          </Button>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <Card
      title="我的预约"
      extra={
        <Segmented
          value={statusFilter}
          onChange={(v) => {
            setPage(1);
            setStatusFilter(String(v));
          }}
          options={[
            { label: '已预约', value: '1' },
            { label: '已取消', value: '2' },
            { label: '已签到', value: '3' },
            { label: '全部', value: 'all' },
          ]}
        />
      }
    >
      {contextHolder}
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
    </Card>
  );
}

export default MemberBookings;
