import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileNav from './MobileNav';
import { SessionTimeoutWarning } from '@/components/ui/SessionTimeoutWarning';
import type { PageProps } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;

    if (!auth.user) return null;

    return (
        <div className="min-h-screen bg-page">
            <Sidebar />
            <main className="md:pl-[240px] min-h-screen flex flex-col">
                <TopHeader />
                <div className="flex-1 w-full p-4 md:p-6 pb-24 md:pb-6">
                    {children}
                </div>
            </main>
            <MobileNav />
            <SessionTimeoutWarning />
        </div>
    );
}
