'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Banknote, Car, ArrowLeft, Eye, EyeOff, Receipt, Wallet } from 'lucide-react';
import Link from 'next/link';

import { LoadingOverlay } from '@/components/ui/loading-overlay';

export default function CashierLoginPage() {
    const { login, isLoading } = useAuth({ middleware: 'guest', redirectIfAuthenticated: '/dashboard' });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login.mutateAsync({ email, password });
        } catch (err: any) {
            console.error('Login Error Full:', err);

            if (err.code === 'ERR_NETWORK') {
                setError('Unable to connect to server. Please check your internet connection or if the server is running.');
            } else if (err.response) {
                setError(err.response.data?.message || `Server Error: ${err.response.status}`);
            } else {
                setError(err.message || 'Login failed');
            }
        }
    };

    return (
        <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Deep Red Branding */}
            <div className="hidden lg:flex flex-col relative bg-[#450a0a] text-white overflow-hidden">
                <div className="relative z-10 flex flex-col justify-between h-full p-12">
                    <Link href="/login" className="flex items-center gap-2 text-sm text-red-200 hover:text-white transition-colors w-fit">
                        <ArrowLeft className="w-4 h-4" />
                        Back to portals
                    </Link>

                    <div className="space-y-8 max-w-md">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-500/30">
                                <Banknote className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold leading-tight">Cash Portal</h2>
                            <p className="text-red-200 mt-3 leading-relaxed">
                                Securely process payments, manage invoices, and finalize daily closing reports.
                            </p>
                        </div>

                        {/* Feature highlights */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-red-200">
                                <Receipt className="w-4 h-4 text-red-400" />
                                Instant invoice generation
                            </div>
                            <div className="flex items-center gap-3 text-sm text-red-200">
                                <Wallet className="w-4 h-4 text-red-400" />
                                Multiple payment methods
                            </div>
                            <div className="flex items-center gap-3 text-sm text-red-200">
                                <Banknote className="w-4 h-4 text-red-400" />
                                Verified daily reconciliation
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-red-200" />
                        <span className="text-sm text-red-200">PerfectService POS</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-sm space-y-6">
                    <Link href="/login" className="flex lg:hidden items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to portals
                    </Link>

                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-xl bg-red-600">
                                <Banknote className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Cash Portal</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Operator Login</h1>
                        <p className="text-sm text-gray-500">
                            Enter your credentials to access the POS system
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white h-11 focus:ring-red-600 focus:border-red-600"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white h-11 pr-10 focus:ring-red-600 focus:border-red-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 h-11 text-white font-bold">
                            Sign In to Portal
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-400">
                        Secure transaction environment enabled
                    </p>
                </div>
            </div>
            <LoadingOverlay isLoading={isLoading} message="Accessing Cash Portal..." />
        </div>
    );
}
