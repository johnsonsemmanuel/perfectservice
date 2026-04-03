import { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Shield, Users, Wrench, Banknote, UserCog, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type Role = { title: string; subtitle: string; key: string; icon: any; bg: string };

const roles: Role[] = [
    { title: 'Manager',         subtitle: 'Full system control & oversight',  key: 'manager',         icon: Shield,  bg: 'bg-black' },
    { title: 'Service Advisor', subtitle: 'Job cards & customer service',      key: 'service_advisor', icon: UserCog, bg: 'bg-neutral-900' },
    { title: 'Cash Officer',    subtitle: 'Payments & invoicing',              key: 'cash_officer',    icon: Banknote, bg: 'bg-red-950' },
    { title: 'Technician',      subtitle: 'View jobs & update status',         key: 'technician',      icon: Wrench,  bg: 'bg-[#1e3a5f]' },
];

export default function Login() {
    const { errors } = usePage().props as any;
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/web-login');
    };

    // ── Role selector ──────────────────────────────────────────
    if (!selectedRole) {
        return (
            <div className="min-h-screen bg-red-600 flex items-center justify-center p-6">
                <div className="w-full max-w-2xl space-y-8">
                    {/* Brand */}
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">PerfectService POS</h1>
                        <p className="text-red-100 text-sm mt-2">Select your portal to sign in</p>
                    </div>

                    {/* 2×2 grid of role cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            return (
                                <button
                                    key={role.key}
                                    onClick={() => setSelectedRole(role)}
                                    className={`group flex flex-col items-center justify-center gap-3 p-8 ${role.bg} rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-200 border border-white/5 text-center`}
                                >
                                    <div className="p-4 rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{role.title}</h3>
                                        <p className="text-sm text-gray-400 mt-0.5">{role.subtitle}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <p className="text-center text-sm text-white/60">
                        Protected by PerfectService Security<br />
                        <span className="text-white/80 text-xs">Unauthorized access is prohibited</span>
                    </p>
                </div>
            </div>
        );
    }

    // ── Login form ─────────────────────────────────────────────
    const Icon = selectedRole.icon;
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left branding panel */}
            <div className="hidden lg:flex flex-col bg-black text-white p-12 justify-between">
                <button
                    onClick={() => setSelectedRole(null)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to portals
                </button>
                <div className="space-y-6 max-w-md">
                    <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold">{selectedRole.title} Portal</h2>
                        <p className="text-gray-400 mt-3">{selectedRole.subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-500">PerfectService POS</span>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-sm space-y-6">
                    <button
                        onClick={() => setSelectedRole(null)}
                        className="flex lg:hidden items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to portals
                    </button>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 rounded-xl bg-red-900">
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-red-900 uppercase tracking-wide">
                                {selectedRole.title} Portal
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                        <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="bg-white pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Server-side validation errors */}
                        {errors?.email && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                {errors.email}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-black hover:bg-gray-900 text-white"
                        >
                            {processing
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                                : 'Sign In'
                            }
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-400">Unauthorized access is prohibited</p>
                </div>
            </div>
        </div>
    );
}
