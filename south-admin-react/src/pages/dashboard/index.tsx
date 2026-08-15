import { useState, useCallback, useEffect } from 'react';
import { useEffectOnActive } from 'keepalive-for-react';
import { getDashboardData, type DashboardStats } from '@/servers/dashboard';
import Bar from './components/Bar';
import Line from './components/Line';
import Block from './components/Block';

function Dashboard() {
  const [isLoading, setLoading] = useState(false);
  const { permissions, isPhone } = useCommonStore();
  const isPermission = checkPermission('/dashboard', permissions);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDashboardData();
      if (Number(res.code) === 200) {
        setStats(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffectOnActive(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <BaseContent isPermission={isPermission}>
      <BaseCard className="mt-10px">
        <div className="pt-10px">
          <Block data={stats} loading={isLoading} />
        </div>

        <div className="flex flex-wrap justify-between w-full">
          <div className={`mb-10px ${isPhone ? 'w-full' : 'w-49.5%'}`}>
            <Line data={stats?.dailyBookings} loading={isLoading} />
          </div>
          <div className={`mb-10px ${isPhone ? 'w-full' : 'w-49.5%'}`}>
            <Bar data={stats?.topCourses} loading={isLoading} />
          </div>
        </div>
      </BaseCard>
    </BaseContent>
  );
}

export default Dashboard;
