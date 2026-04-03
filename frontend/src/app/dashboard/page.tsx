'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { ServiceAdvisorDashboard } from '@/components/dashboard/ServiceAdvisorDashboard';
import { CashOfficerDashboard } from '@/components/dashboard/CashOfficerDashboard';
import { TechnicianDashboard } from '@/components/dashboard/TechnicianDashboard';

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await api.get('/dashboard/stats');
            return res.data;
        },
        enabled: !!user,
    });

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!user || !stats) return null;

    if (user.role === 'service_advisor') {
        return <ServiceAdvisorDashboard stats={stats} user={user} />;
    }

    if (user.role === 'cash_officer') {
        return <CashOfficerDashboard stats={stats} user={user} />;
    }

    if (user.role === 'technician') {
        return <TechnicianDashboard stats={stats} user={user} />;
    }

    // Default to Manager for manager/admin roles
    return <ManagerDashboard stats={stats} user={user} />;
}
