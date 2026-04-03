'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Wallet, ClipboardList, TrendingUp, TrendingDown, Car, AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Link from 'next/link';

const DONUT_COLORS = ['#dc2626', '#b91c1c', '#fca5a5'];

export function ManagerDashboard({ stats, user }: { stats: any, user: any }) {
    const statCards = [
        {
            title: 'Revenue',
            value: `GH₵${stats?.today?.revenue?.toLocaleString() ?? '0.00'}`,
            icon: Wallet,
            change: stats?.today?.revenue_change ?? 0,
            changeLabel: 'From last month',
            highlight: true,
        },
        {
            title: 'Outstanding Balance',
            value: `GH₵${stats?.outstanding?.balance?.toLocaleString() ?? '0.00'}`,
            icon: AlertTriangle,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            change: 0,
            changeLabel: `${stats?.outstanding?.open_job_cards ?? 0} active jobs`,
        },
        {
            title: 'Vehicles',
            value: stats?.today?.job_cards ?? 0,
            icon: Car,
            change: stats?.today?.vehicle_change ?? 0,
            changeLabel: 'From last month',
        },
        {
            title: 'Invoices Issued',
            value: stats?.today?.invoices ?? 0,
            icon: ClipboardList,
            change: stats?.today?.job_change ?? 0,
            changeLabel: 'From last month',
        },
    ];

    // Build donut data from stats or use defaults
    const serviceBreakdown = stats?.service_breakdown ?? [
        { name: 'Mechanical', value: 44 },
        { name: 'Electrical', value: 32 },
        { name: 'Body Work', value: 24 },
    ];

    const totalServices = serviceBreakdown.reduce((acc: number, item: any) => acc + item.value, 0);

    return (
        <div className="space-y-6 -mt-4">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">Overview of your business performance.</p>
                </div>
                <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 font-medium">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
            </div>

            {/* Critical Alerts Section */}
            {stats?.critical_alerts && stats.critical_alerts.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">Requires Attention</h3>
                    </div>
                    <div className="space-y-2">
                        {stats.critical_alerts.map((alert: any) => (
                            <div key={alert.id} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-red-100/50">
                                <div className="flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-sm font-medium text-gray-900">{alert.action}</span>
                                    <span className="text-xs text-gray-500 line-clamp-1">
                                        by {alert.user?.name} &bull; {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <Link href={`/dashboard/audit-logs?id=${alert.id}`} className="text-xs font-bold text-red-600 hover:underline shrink-0">
                                    View
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    const isPositive = (stat.change ?? 0) >= 0;
                    return (
                        <div
                            key={stat.title}
                            className={`bg-white rounded-2xl p-5 transition-shadow hover:shadow-md ${stat.highlight
                                ? 'ring-2 ring-red-600 shadow-md'
                                : 'border border-gray-100'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <div className={`p-2 rounded-xl ${(stat as any).iconBg || (stat.highlight ? 'bg-red-50' : 'bg-gray-100')}`}>
                                    <Icon className={`w-4 h-4 ${(stat as any).iconColor || (stat.highlight ? 'text-red-600' : 'text-gray-600')}`} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                            <div className="flex items-center gap-1.5">
                                {stat.change !== 0 ? (
                                    <>
                                        {isPositive ? (
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                        )}
                                        <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {Math.abs(stat.change)}%
                                        </span>
                                    </>
                                ) : (
                                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                )}
                                <span className="text-xs text-gray-400 line-clamp-1">{stat.changeLabel}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative w-[200px] h-[200px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={serviceBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {serviceBreakdown.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="text-xl font-bold text-gray-900">{totalServices.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Service Breakdown</h3>
                                {serviceBreakdown.map((item: any, index: number) => (
                                    <div key={item.name} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                                            <span className="text-sm text-gray-600">{item.name} ({Math.round((item.value / (totalServices || 1)) * 100)}%)</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Bar Chart */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.revenue_chart ?? []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₵${value}`} />
                                <Tooltip
                                    formatter={(value: any) => [`GH₵${value}`, 'Revenue']}
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '12px' }}
                                />
                                <Bar dataKey="total" fill="#dc2626" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Table */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                    <Link href="/dashboard/invoices" className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
                        View All →
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-left py-3 px-4 rounded-l-xl font-medium text-xs">Invoice</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs">Customer</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs">Amount</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs">Date</th>
                                    <th className="text-left py-3 px-4 rounded-r-xl font-medium text-xs">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_invoices?.map((invoice: any) => (
                                    <tr key={invoice.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoice_number}</td>
                                        <td className="py-3 px-4 text-gray-600">{invoice.job_card?.customer_name || '—'}</td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">GH₵{Number(invoice.total).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                            {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={invoice.status} type="invoice" />
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recent_invoices || stats.recent_invoices.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400">No recent activity</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
