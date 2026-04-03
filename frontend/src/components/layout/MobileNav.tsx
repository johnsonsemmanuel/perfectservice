'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    ClipboardList,
    Wallet,
    FileText,
    MoreHorizontal,
    Wrench,
    History,
    Settings,
    X,
    LogOut,
    Users,
} from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showMore, setShowMore] = useState(false);

    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === path;
        return pathname.startsWith(path);
    };

    const mainTabs = [
        { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Jobs', href: '/dashboard/job-cards', icon: ClipboardList, roles: ['manager', 'service_advisor', 'technician'] },
        { name: 'Invoices', href: '/dashboard/invoices', icon: Wallet, roles: ['manager', 'cash_officer'] },
        { name: 'Closing', href: '/dashboard/daily-closing', icon: FileText, roles: ['manager', 'cash_officer'] },
    ];

    const moreTabs = [
        { name: 'Customers', href: '/dashboard/customers', icon: Users, roles: ['manager', 'service_advisor', 'cash_officer'] },
        { name: 'Services', href: '/dashboard/services', icon: Wrench, roles: ['manager'] },
        { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: History, roles: ['manager'] },
        { name: 'Staff', href: '/dashboard/staff', icon: Users, roles: ['manager'] },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['manager'] },
    ];

    const filteredMainTabs = mainTabs.filter(
        (tab) => !tab.roles || (user && tab.roles.includes(user.role))
    );

    const filteredMoreTabs = moreTabs.filter(
        (tab) => !tab.roles || (user && tab.roles.includes(user.role))
    );

    return (
        <>
            {/* More Sheet Overlay */}
            {showMore && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowMore(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-slide-up pb-safe">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">More</h3>
                            <button
                                onClick={() => setShowMore(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-1">
                            {filteredMoreTabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = isActive(tab.href);
                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        onClick={() => setShowMore(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all',
                                            active
                                                ? 'bg-red-50 text-red-700'
                                                : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                                        )}
                                    >
                                        <Icon className={cn('h-5 w-5', active ? 'text-red-700' : 'text-gray-400')} />
                                        {tab.name}
                                    </Link>
                                );
                            })}
                            <div className="border-t border-gray-100 mt-2 pt-2">
                                <button
                                    onClick={() => { logout.mutate(); setShowMore(false); }}
                                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 active:bg-red-100 transition-all"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 pb-safe">
                <div className="flex items-center justify-around h-16">
                    {filteredMainTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90',
                                    active ? 'text-red-600' : 'text-gray-400'
                                )}
                            >
                                <Icon className={cn('h-5 w-5 transition-all', active && 'scale-110')} />
                                <span className={cn('text-[10px] font-medium', active && 'font-bold')}>{tab.name}</span>
                                {active && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-600" />
                                )}
                            </Link>
                        );
                    })}
                    {/* More Button */}
                    {filteredMoreTabs.length > 0 && (
                        <button
                            onClick={() => setShowMore(true)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all active:scale-90',
                                showMore ? 'text-red-600' : 'text-gray-400'
                            )}
                        >
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="text-[10px] font-medium">More</span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
