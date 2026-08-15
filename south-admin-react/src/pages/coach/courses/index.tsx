import { useEffect, useState } from 'react';
import { Card, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getCoachCourses } from '@/servers/portal';

interface Row {
  id: number;
  name: string;
  typeName: string | null;
  locationName: string | null;
  capacity: number;
  status: number;
}

const STATUS_MAP: Record<number, { text: string; color: string }> = {
  1: { text: '开放预约', color: 'green' },
  2: { text: '已满', color: 'orange' },
  3: { text: '已取消', color: 'red' },
  4: { text: '已结束', color: 'blue' },
};

/** 教练端：我负责的课程 */
function CoachCourses() {
  const [data, setData] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res: any = await getCoachCourses({ page, pageSize });
        const payload = res?.data ?? res;
        setData(payload?.items ?? []);
        setTotal(payload?.total ?? 0);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize]);

  const columns: ColumnsType<Row> = [
    { title: '课程名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'typeName', render: (v) => v || '-' },
    { title: '场地', dataIndex: 'locationName', render: (v) => v || '-' },
    { title: '容量', dataIndex: 'capacity' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s: number) => {
        const m = STATUS_MAP[s] || { text: '-', color: 'default' };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
  ];

  return (
    <Card title="我的课程">
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

export default CoachCourses;
