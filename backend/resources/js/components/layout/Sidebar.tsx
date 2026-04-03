import { Link, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, ClipboardList, FileText, Settings,
    LogOut, Wrench, Wallet, History, Users, Car, ShoppingCart,
} from 'lucide-react';

type NavItem = {
    name: string;
    href: string;
    icon: React.ElementType;
    roles: string[];
};

type NavSection = {
    label?: string;
    items: NavItem[];
};

const navSections: NavSection[] = [
    {
        items: [
            { name: 'Dashboard',  href: '/dashboard',     icon: LayoutDashboard, roles: ['manager', 'cash_officer', 'service_advisor', 'technician'] },
        ],
    },
    {
        label: 'Operations',
        items: [
            { name: 'POS',        href: '/dashboard/pos',           icon: ShoppingCart, roles: ['manager', 'cash_officer', 'service_advisor'] },
            { name: 'Job Cards',  href: '/dashboard/job-cards',     icon: ClipboardList, roles: ['manager', 'service_advisor', 'technician'] },
            { name: 'Customers',  href: '/dashboard/customers',     icon: Users,         roles: ['manager', 'service_advisor', 'cash_officer'] },
            { name: 'Invoices',   href: '/dashboard/invoices',      icon: Wallet,        roles: ['manager', 'cash_officer'] },
            { name: 'Daily Closing', href: '/dashboard/daily-closing', icon: FileText,   roles: ['manager', 'cash_officer'] },
        ],
    },
    {
        label: 'Management',
        items: [
            { name: 'Services',   href: '/dashboard/services',      icon: Wrench,   roles: ['manager'] },
            { name: 'Staff',      href: '/dashboard/staff',         icon: Users,    roles: ['manager'] },
            { name: 'Audit Logs', href: '/dashboard/audit-logs',    icon: History,  roles: ['manager'] },
            { name: 'Settings',   href: '/dashboard/settings',      icon: Settings, roles: ['manager'] },
        ],
    },
];

export default function Sidebar() {
    const { url } = usePage();
    const { user, logout } = useAuth();

    const isActive = (path: string) =>
        path === '/dashboard' ? url === path : url.startsWith(path);

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <aside className="hidden md:flex w-[240px] bg-[#0a0a0a] text-white flex-col fixed inset-y-0 z-50 border-r border-white/[0.06]">
            {/* Logo */}
            <div className="h-[64px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
                        <Car className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="text-[13px] font-bold tracking-tight text-white">PerfectService</span>
                        <p className="text-[10px] text-white/30 leading-none mt-0.5">Auto Workshop POS</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
                {navSections.map((section, si) => {
                    const visible = section.items.filter(l => !user || l.roles.includes(user.role));
                    if (visible.length === 0) return null;
                    return (
                        <div key={si}>
                            {section.label && (
                                <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/25 select-none">
                                    {section.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {visible.map((link) => {
                                    const Icon = link.icon;
                                    const active = isActive(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 group',
                                                active
                                                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                                    : 'text-white/50 hover:text-white hover:bg-white/[0.07]'
                                            )}
                                        >
                                            <Icon className={cn(
                                                'h-4 w-4 shrink-0 transition-colors',
                                                active ? 'text-white' : 'text-white/35 group-hover:text-white/70'
                                            )} />
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* User footer */}
            <div className="shrink-0 border-t border-white/[0.06] p-3">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-[11px] font-bold text-white shrink-0 shadow-sm">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white truncate leading-tight">{user?.name}</p>
                        <p className="text-[11px] text-white/35 truncate capitalize leading-tight mt-0.5">{user?.role_display}</p>
                    </div>
                    <button
                        onClick={() => logout.mutate()}
                        aria-label="Sign out"
                        className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
