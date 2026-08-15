import type { EChartsCoreOption } from 'echarts';
import { Spin } from 'antd';

interface DailyBooking {
  date: string;
  count: number;
}

interface LineProps {
  data: DailyBooking[] | undefined;
  loading: boolean;
}

function Line({ data, loading }: LineProps) {
  const dates = (data ?? []).map((d) => d.date?.slice(5)); // MM-DD
  const counts = (data ?? []).map((d) => d.count);

  const option: EChartsCoreOption = {
    title: {
      text: '近 7 天预约趋势',
      left: 30,
      top: 5,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates.length > 0 ? dates : [],
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    series: [
      {
        name: '预约数',
        type: 'line',
        areaStyle: {
          color: '#1890ff',
          opacity: 0.2,
        },
        emphasis: {
          focus: 'series',
        },
        data: counts,
        smooth: true,
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

export default Line;
