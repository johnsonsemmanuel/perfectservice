import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard, ClipboardList, Wallet, FileText,
    MoreHorizontal, Wrench, History, Settings, X,
    LogOut, Users, ShoppingCart, Car,
} from 'lucide-react';

export default function MobileNav() {
    const { url } = usePage();
    const { user, logout } = useAuth();
    const [showMore, setShowMore] = useState(false);

    const isActive = (path: string) =>
        path === '/dashboard' ? url === path : url.startsWith(path);

    const mainTabs = [
        { name: 'Home',     href: '/dashboard',               icon: LayoutDashboard, roles: ['manager', 'cash_officer', 'service_advisor', 'technician'] },
        { name: 'POS',      href: '/dashboard/pos',           icon: ShoppingCart,    roles: ['manager', 'cash_officer', 'service_advisor'] },
        { name: 'Jobs',     href: '/dashboard/job-cards',     icon: ClipboardList,   roles: ['manager', 'service_advisor', 'technician'] },
        { name: 'Invoices', href: '/dashboard/invoices',      icon: Wallet,          roles: ['manager', 'cash_officer'] },
        { name: 'Closing',  href: '/dashboard/daily-closing', icon: FileText,        roles: ['manager', 'cash_officer'] },
    ];

    const moreTabs = [
        { name: 'Customers',  href: '/dashboard/customers',    icon: Users,    roles: ['manager', 'service_advisor', 'cash_officer'] },
        { name: 'Services',   href: '/dashboard/services',     icon: Wrench,   roles: ['manager'] },
        { name: 'Audit Logs', href: '/dashboard/audit-logs',   icon: History,  roles: ['manager'] },
        { name: 'Staff',      href: '/dashboard/staff',        icon: Users,    roles: ['manager'] },
        { name: 'Settings',   href: '/dashboard/settings',     icon: Settings, roles: ['manager'] },
    ];

    const filter = (tabs: typeof mainTabs) =>
        tabs.filter(t => !t.roles || (user && t.roles.includes(user.role)));

    const visibleMain = filter(mainTabs);
    const visibleMore = filter(moreTabs);
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <>
            {/* More drawer */}
            {showMore && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowMore(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-gray-200" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
                                    <Car className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-900">More</span>
                            </div>
                            <button
                                onClick={() => setShowMore(false)}
                                aria-label="Close menu"
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Links */}
                        <div className="p-3 space-y-0.5">
                            {visibleMore.map((tab) => {
                                const Icon = tab.icon;
                                const active = isActive(tab.href);
                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        aria-current={active ? 'page' : undefined}
                                        onClick={() => setShowMore(false)}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                                            active
                                                ? 'bg-red-50 text-red-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                        )}
                                    >
                                        <Icon className={cn('h-4.5 w-4.5', active ? 'text-red-600' : 'text-gray-400')} />
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User + logout */}
                        <div className="mx-3 mb-3 mt-1 border-t border-gray-100 pt-3">
                            <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-400 capitalize truncate">{user?.role_display}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { logout.mutate(); setShowMore(false); }}
                                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4 w-4" /> Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom tab bar */}
            <nav
                aria-label="Mobile navigation"
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
            >
                <div className="flex items-stretch h-[60px]">
                    {visibleMain.map((tab) => {
                        const Icon = tab.icon;
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 flex-1 transition-colors relative',
                                    active ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
                                )}
                            >
                                {/* Active indicator dot */}
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-red-600" />
                                )}
                                <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
                                <span className={cn('text-[10px] font-medium', active && 'font-bold')}>{tab.name}</span>
                            </Link>
                        );
                    })}

                    {visibleMore.length > 0 && (
                        <button
                            onClick={() => setShowMore(true)}
                            aria-expanded={showMore}
                            aria-label="More navigation options"
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 flex-1 transition-colors',
                                showMore ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'
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
