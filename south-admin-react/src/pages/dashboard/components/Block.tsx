import { Row, Col, Spin } from 'antd';
import { Icon } from '@iconify/react';
import Count from '@/components/Count';
import type { DashboardStats } from '@/servers/dashboard';

interface BlockProps {
  data: DashboardStats | null;
  loading: boolean;
}

function Block({ data, loading }: BlockProps) {
  const { isPhone } = useCommonStore();

  const list = [
    {
      title: '会员总数',
      num: data?.totalMembers ?? 0,
      icon: 'icon-park:peoples',
    },
    {
      title: '课程总数',
      num: data?.totalCourses ?? 0,
      icon: 'icon-park:file-collections',
    },
    {
      title: '预约总数',
      num: data?.totalBookings ?? 0,
      icon: 'icon-park:transaction-order',
    },
    {
      title: '教练总数',
      num: data?.totalCoaches ?? 0,
      icon: 'icon-park:personal-data',
    },
  ];

  return (
    <Spin spinning={loading}>
      <Row gutter={16}>
        {list.map((item) => (
          <Col
            key={item.title}
            sm={24}
            md={12}
            lg={6}
            className={`pb-10px ${isPhone ? 'w-full' : ''}`}
          >
            <div
              className={`
                border
                border-gray-200
                px-30px
                py-20px
                box-border
                rounded-10px
              `}
            >
              <div className="text-20px font-bold">{item.title}</div>
              <div className="flex items-center justify-between text-35px mb-15px">
                <Count className="font-bold" start={0} end={item.num} />
                <Icon icon={item.icon} />
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Spin>
  );
}

export default Block;
