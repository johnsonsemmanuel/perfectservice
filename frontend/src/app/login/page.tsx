'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Car, Shield, Users, Wrench, Banknote, UserCog, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { isLoading, user } = useAuth({ middleware: 'guest', redirectIfAuthenticated: '/dashboard' });

    // Don't render role selection while checking auth — prevents the flash
    if (isLoading || user) {
        return (
            <div className="min-h-screen bg-[#DC2626] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
        );
    }

    const roles = [
        {
            title: 'Manager',
            subtitle: 'Full system control & oversight',
            href: '/login/manager',
            icon: Shield,
            bg: 'bg-black',
            iconBg: 'bg-white/10',
        },
        {
            title: 'Service Advisor',
            subtitle: 'Job cards & customer service',
            href: '/login/staff',
            icon: UserCog,
            bg: 'bg-neutral-900',
            iconBg: 'bg-white/10',
        },
        {
            title: 'Cash Officer',
            subtitle: 'Payments & invoicing',
            href: '/login/cashier',
            icon: Banknote,
            bg: 'bg-red-950',
            iconBg: 'bg-white/10',
        },
        {
            title: 'Technician',
            subtitle: 'View jobs & update status',
            href: '/login/technician',
            icon: Wrench,
            bg: 'bg-[#1e3a5f]',
            iconBg: 'bg-white/10',
        },
    ];

    return (
        <div className="min-h-screen bg-[#DC2626] flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-8">
                {/* Brand */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">PerfectService POS</h1>
                    <p className="text-red-100 text-sm mt-2">Select your portal to sign in</p>
                </div>

                {/* Role Cards */}
                <div className="space-y-3">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        return (
                            <Link
                                key={role.title}
                                href={role.href}
                                className={`group flex items-center gap-4 p-5 ${role.bg} rounded-2xl shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 border border-white/5 relative overflow-hidden`}
                            >
                                <div className={`p-3 rounded-2xl ${role.iconBg} transition-transform duration-300`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 z-10">
                                    <h3 className="text-lg font-bold text-white transition-colors">{role.title}</h3>
                                    <p className="text-sm text-gray-400 transition-colors">{role.subtitle}</p>
                                </div>
                                <svg className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-white/60">
                    Protected by PerfectService Security<br />
                    <span className="text-white/80 text-xs">Unauthorized access is prohibited</span>
                </p>
            </div>
        </div>
    );
}
