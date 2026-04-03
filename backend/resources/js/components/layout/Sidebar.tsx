import { Link, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, ClipboardList, FileText, Settings,
    LogOut, Wrench, Wallet, History, Users, Car, ShoppingCart,
} from 'lucide-react';

export default function Sidebar() {
    const { url } = usePage();
    const { user, logout } = useAuth();

    const isActive = (path: string) => {
        if (path === '/dashboard') return url === path;
        return url.startsWith(path);
    };

    const links = [
        { name: 'Dashboard',     href: '/dashboard',              icon: LayoutDashboard, roles: ['manager', 'cash_officer', 'service_advisor', 'technician'] },
        { name: 'POS',           href: '/dashboard/pos',          icon: ShoppingCart,    roles: ['manager', 'cash_officer', 'service_advisor'] },
        { name: 'Job Cards',     href: '/dashboard/job-cards',    icon: ClipboardList,   roles: ['manager', 'service_advisor', 'technician'] },
        { name: 'Customers',     href: '/dashboard/customers',    icon: Users,           roles: ['manager', 'service_advisor', 'cash_officer'] },
        { name: 'Invoices',      href: '/dashboard/invoices',     icon: Wallet,          roles: ['manager', 'cash_officer'] },
        { name: 'Services',      href: '/dashboard/services',     icon: Wrench,          roles: ['manager'] },
        { name: 'Daily Closing', href: '/dashboard/daily-closing',icon: FileText,        roles: ['manager', 'cash_officer'] },
        { name: 'Audit Logs',    href: '/dashboard/audit-logs',   icon: History,         roles: ['manager'] },
        { name: 'Staff',         href: '/dashboard/staff',        icon: Users,           roles: ['manager'] },
        { name: 'Settings',      href: '/dashboard/settings',     icon: Settings,        roles: ['manager'] },
    ];

    const filteredLinks = links.filter(l => !user || l.roles.includes(user.role));
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <aside className="hidden md:flex w-[240px] bg-black text-white flex-col fixed inset-y-0 z-50">
            <div className="h-[72px] flex items-center px-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight">PerfectService</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {filteredLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all duration-200 group',
                                active ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <Icon className={cn('mr-3 h-[18px] w-[18px]', active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300')} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-red-700 flex items-center justify-center text-xs font-bold border border-white/10">
                        {initials}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate capitalize">{user?.role_display}</p>
                    </div>
                </div>
                <button
                    onClick={() => logout.mutate()}
                    aria-label="Logout"
                    className="flex w-full items-center px-3 py-2 text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                >
                    <LogOut className="mr-3 h-[18px] w-[18px]" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
