import type { EChartsCoreOption } from 'echarts';
import { Spin } from 'antd';

interface TopCourse {
  courseId: number;
  courseName: string;
  bookingCount: number;
}

interface BarProps {
  data: TopCourse[] | undefined;
  loading: boolean;
}

function Bar({ data, loading }: BarProps) {
  // 按 bookingCount 升序排列（柱状图从下到上）
  const sorted = [...(data ?? [])].sort((a, b) => a.bookingCount - b.bookingCount);
  const names = sorted.map((c) => c.courseName);
  const values = sorted.map((c) => c.bookingCount);

  const option: EChartsCoreOption = {
    title: {
      text: '热门课程 Top 5',
      left: 30,
      top: 5,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '预约数',
    },
    yAxis: {
      type: 'category',
      data: names.length > 0 ? names : ['暂无数据'],
    },
    series: [
      {
        name: '预约数',
        type: 'bar',
        data: values.length > 0 ? values : [0],
        itemStyle: {
          color: '#1890ff',
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  const [echartsRef] = useEcharts(option, [data]);

  return (
    <Spin spinning={loading}>
      <div className="h-550px border border-gray-200 rounded-10px">
        <div ref={echartsRef} className="w-full h-full"></div>
      </div>
    </Spin>
  );
}

export default Bar;
