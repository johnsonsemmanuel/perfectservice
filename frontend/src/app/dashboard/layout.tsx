'use client';

import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import MobileNav from '@/components/layout/MobileNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth({ middleware: 'auth' });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Hook handles redirect

    return (
        <div className="min-h-screen bg-surface">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="md:pl-[240px] min-h-screen flex flex-col">
                <TopHeader />
                <div className="flex-1 p-4 md:p-6 lg:p-8 w-full pb-20 md:pb-8">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
