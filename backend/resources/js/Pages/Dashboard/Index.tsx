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

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data;
        },
        enabled: !!user,
    });

    const content = () => {
        if (isLoading || !stats) return <DashboardSkeleton />;
        if (user?.role === 'service_advisor') return <ServiceAdvisorDashboard stats={stats} user={user} />;
        if (user?.role === 'cash_officer') return <CashOfficerDashboard stats={stats} user={user} />;
        if (user?.role === 'technician') return <TechnicianDashboard stats={stats} user={user} />;
        return <ManagerDashboard stats={stats} user={user} />;
    };

    return <DashboardLayout>{content()}</DashboardLayout>;
}
