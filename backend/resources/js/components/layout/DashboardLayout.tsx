import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import MobileNav from './MobileNav';
import type { PageProps } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { auth } = usePage<PageProps>().props;

    if (!auth.user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:pl-[240px] min-h-screen flex flex-col">
                <TopHeader />
                <div className="flex-1 p-4 md:p-6 lg:p-8 w-full pb-20 md:pb-8">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
