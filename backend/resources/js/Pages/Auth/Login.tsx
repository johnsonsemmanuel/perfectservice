import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Login() {
    const { errors } = usePage().props as any;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/web-login');
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Left panel — branding ─────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] relative bg-black flex-col justify-between p-12 overflow-hidden">
                {/* Subtle grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
                {/* Red accent glow */}
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/3 -right-24 w-[300px] h-[300px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30">
                        <Car className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">PerfectService</span>
                </div>

                {/* Hero copy */}
                <div className="relative space-y-6 max-w-md">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/70 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Auto Service Management Platform
                    </div>
                    <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
                        Run your workshop<br />
                        <span className="text-red-500">smarter.</span>
                    </h1>
                    <p className="text-gray-400 text-base leading-relaxed">
                        Job cards, invoicing, POS, daily closings — everything your team needs in one place.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {['Job Cards', 'Invoicing', 'POS Terminal', 'Daily Closing', 'Audit Logs'].map(f => (
                            <span key={f} className="text-xs bg-white/8 border border-white/10 text-white/60 rounded-lg px-3 py-1.5">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative flex items-center gap-2 text-white/30 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Unauthorized access is strictly prohibited
                </div>
            </div>

            {/* ── Right panel — form ────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-[380px] space-y-8">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2.5 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
                            <Car className="w-4.5 h-4.5 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 text-base">PerfectService</span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</h2>
                        <p className="text-sm text-gray-500">Enter your credentials to access your portal</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@perfectservice.com"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-11 bg-white border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-xl"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="h-11 bg-white border-gray-200 focus:border-red-500 focus:ring-red-500/20 rounded-xl pr-11"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {errors?.email && (
                            <div role="alert" className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm p-3.5 rounded-xl border border-red-100">
                                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold">!</span>
                                {errors.email}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-sm shadow-red-600/20 transition-all"
                        >
                            {processing
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                                : 'Sign in'
                            }
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-400">
                        Protected by PerfectService Security
                    </p>
                </div>
            </div>
        </div>
    );
}
