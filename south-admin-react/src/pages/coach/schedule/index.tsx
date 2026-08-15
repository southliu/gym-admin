import { useEffect, useState } from 'react';
import { Card, Table, Tag, Empty, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getCoachSchedule } from '@/servers/portal';

interface TemplateRow {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface OverrideRow {
  id: number;
  overrideDate: string;
  type: number;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
}

const WEEK = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const OVERRIDE_TYPE: Record<number, { text: string; color: string }> = {
  1: { text: '请假', color: 'red' },
  2: { text: '加班', color: 'green' },
  3: { text: '换班', color: 'blue' },
};

/** 教练端：我的排班（周循环模板 + 日期例外） */
function CoachSchedule() {
  const [profile, setProfile] = useState<any>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [overrides, setOverrides] = useState<OverrideRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res: any = await getCoachSchedule();
        const payload = res?.data ?? res;
        setProfile(payload?.coach ?? null);
        setTemplates(payload?.templates ?? []);
        setOverrides(payload?.overrides ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const templateColumns: ColumnsType<TemplateRow> = [
    {
      title: '星期',
      dataIndex: 'dayOfWeek',
      render: (d: number) => WEEK[d] ?? '-',
    },
    { title: '开始时间', dataIndex: 'startTime' },
    { title: '结束时间', dataIndex: 'endTime' },
  ];

  const overrideColumns: ColumnsType<OverrideRow> = [
    { title: '日期', dataIndex: 'overrideDate' },
    {
      title: '类型',
      dataIndex: 'type',
      render: (t: number) => {
        const m = OVERRIDE_TYPE[t] || { text: '-', color: 'default' };
        return <Tag color={m.color}>{m.text}</Tag>;
      },
    },
    {
      title: '时间',
      render: (_, r) => (r.startTime && r.endTime ? `${r.startTime}-${r.endTime}` : '-'),
    },
    { title: '原因', dataIndex: 'reason', render: (v) => v || '-' },
  ];

  return (
    <Card title="我的排班" loading={loading}>
      {profile && (
        <Descriptions size="small" column={4} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="姓名">{profile.name}</Descriptions.Item>
          <Descriptions.Item label="专长">{profile.specialties || '-'}</Descriptions.Item>
          <Descriptions.Item label="电话">{profile.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {profile.status === 1 ? '在职' : '离职'}
          </Descriptions.Item>
        </Descriptions>
      )}
      <h4>每周固定排班</h4>
      {templates.length ? (
        <Table rowKey="id" size="small" columns={templateColumns} dataSource={templates} pagination={false} />
      ) : (
        <Empty description="暂无固定排班" />
      )}
      <h4 style={{ marginTop: 24 }}>排班例外（请假/加班/换班）</h4>
      <Table
        rowKey="id"
        size="small"
        columns={overrideColumns}
        dataSource={overrides}
        pagination={false}
      />
    </Card>
  );
}

export default CoachSchedule;
