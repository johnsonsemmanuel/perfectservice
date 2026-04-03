import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { ServiceAdvisorDashboard } from '@/components/dashboard/ServiceAdvisorDashboard';
import { CashOfficerDashboard } from '@/components/dashboard/CashOfficerDashboard';
import { TechnicianDashboard } from '@/components/dashboard/TechnicianDashboard';

export default function DashboardIndex() {
    const { user } = useAuth();
    const [chartRange, setChartRange] = useState<7 | 30>(7);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats', chartRange],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats', {
                params: user?.role === 'manager' ? { range: chartRange } : {},
            });
            return res.data;
        },
        enabled: !!user,
        refetchInterval: 60_000, // auto-refresh every minute
    });

    const content = () => {
        if (isLoading || !stats) return <DashboardSkeleton />;
        if (user?.role === 'service_advisor') return <ServiceAdvisorDashboard stats={stats} user={user} />;
        if (user?.role === 'cash_officer')    return <CashOfficerDashboard stats={stats} user={user} />;
        if (user?.role === 'technician')      return <TechnicianDashboard stats={stats} user={user} />;
        return <ManagerDashboard stats={stats} user={user} chartRange={chartRange} onRangeChange={setChartRange} />;
    };

    return <DashboardLayout>{content()}</DashboardLayout>;
}
