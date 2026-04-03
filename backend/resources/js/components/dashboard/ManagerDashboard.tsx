import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
    Wallet, ClipboardList, TrendingUp, TrendingDown, Car, AlertTriangle,
    ShoppingCart, Package, Users, BarChart3, ArrowRight,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const DONUT_COLORS = ['#dc2626', '#b91c1c', '#f59e0b', '#10b981', '#6366f1', '#fca5a5'];

export function ManagerDashboard({ stats, user, chartRange, onRangeChange }: {
    stats: any; user: any;
    chartRange?: 7 | 30;
    onRangeChange?: (r: 7 | 30) => void;
}) {
    const range = chartRange ?? 7;

    const statCards = [
        {
            title: "Today's Revenue",
            value: `GH₵${Number(stats?.today?.revenue ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`,
            sub: `Service: GH₵${Number(stats?.today?.service_revenue ?? 0).toFixed(2)} · POS: GH₵${Number(stats?.today?.pos_revenue ?? 0).toFixed(2)}`,
            icon: Wallet, highlight: true,
            change: stats?.today?.revenue_change ?? 0,
        },
        {
            title: 'Outstanding',
            value: `GH₵${Number(stats?.outstanding?.balance ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`,
            sub: `${stats?.outstanding?.open_job_cards ?? 0} active jobs`,
            icon: AlertTriangle, iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
        },
        {
            title: "Today's Jobs",
            value: stats?.today?.job_cards ?? 0,
            sub: `${stats?.today?.invoices ?? 0} invoices issued`,
            icon: Car,
        },
        {
            title: 'POS Sales Today',
            value: stats?.today?.pos_sales ?? 0,
            sub: `GH₵${Number(stats?.today?.pos_revenue ?? 0).toFixed(2)} retail`,
            icon: ShoppingCart, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
        },
    ];

    const serviceBreakdown = stats?.service_breakdown ?? [];
    const totalServices = serviceBreakdown.reduce((a: number, i: any) => a + Number(i.value), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/job-cards/create"
                        className="flex items-center gap-2 h-9 px-4 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-900 transition-colors">
                        <ClipboardList className="w-4 h-4" /> New Job Card
                    </Link>
                </div>
            </div>

            {/* Critical Alerts */}
            {stats?.critical_alerts?.length > 0 && (
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
                                    <span className="text-xs text-gray-500">
                                        by {alert.user?.name} · {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <Link href={`/dashboard/audit-logs`} className="text-xs font-bold text-red-600 hover:underline">View</Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Low Stock Alert */}
            {stats?.low_stock?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
                        <Link href="/dashboard/pos" className="ml-auto text-xs font-bold text-yellow-700 hover:underline">Manage Products →</Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {stats.low_stock.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-yellow-100 text-sm">
                                <span className="font-medium text-gray-900">{p.name}</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    const isPositive = (stat.change ?? 0) >= 0;
                    return (
                        <div key={stat.title} className={`bg-white rounded-2xl p-5 hover:shadow-md transition-shadow ${stat.highlight ? 'ring-2 ring-red-600 shadow-md' : 'border border-gray-100'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <div className={`p-2 rounded-xl ${(stat as any).iconBg ?? (stat.highlight ? 'bg-red-50' : 'bg-gray-100')}`}>
                                    <Icon className={`w-4 h-4 ${(stat as any).iconColor ?? (stat.highlight ? 'text-red-600' : 'text-gray-600')}`} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                            <p className="text-xs text-gray-400">{stat.sub}</p>
                            {stat.change !== undefined && stat.change !== 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    {isPositive ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                                    <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{Math.abs(stat.change)}%</span>
                                    <span className="text-xs text-gray-400">vs last month</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {([7, 30] as const).map(d => (
                                <button key={d} onClick={() => onRangeChange?.(d)}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${range === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.revenue_chart ?? []} barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} />
                                <Tooltip
                                    formatter={(v: any, name: string) => [`GH₵${Number(v).toFixed(2)}`, name === 'service' ? 'Service' : 'POS']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '11px' }}
                                />
                                <Bar dataKey="service" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="pos" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                                <Legend formatter={(v) => v === 'service' ? 'Service' : 'POS Retail'} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Service Breakdown Donut */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Service Mix</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {serviceBreakdown.length === 0 ? (
                            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data this month</div>
                        ) : (
                            <>
                                <div className="relative w-full h-[140px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                                                {serviceBreakdown.map((_: any, i: number) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] text-gray-400">Total</p>
                                        <p className="text-lg font-bold text-gray-900">GH₵{Number(totalServices).toFixed(0)}</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 mt-2">
                                    {serviceBreakdown.slice(0, 4).map((item: any, i: number) => (
                                        <div key={item.name} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                                <span className="text-gray-600 capitalize">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">GH₵{Number(item.value).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Staff Performance + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Staff Leaderboard */}
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" /> Staff Performance
                            <span className="text-xs text-gray-400 font-normal ml-auto">This month</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stats?.tech_performance?.length > 0 ? (
                            <>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Technicians — Jobs Completed</p>
                                {stats.tech_performance.map((t: any, i: number) => (
                                    <div key={t.technician} className="flex items-center gap-3">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                        <span className="flex-1 text-sm text-gray-700 truncate">{t.technician}</span>
                                        <span className="text-sm font-bold text-gray-900">{t.jobs_completed}</span>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-4">No completed jobs this month</p>
                        )}
                        {stats?.advisor_performance?.length > 0 && (
                            <>
                                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide mt-4">Advisors — Jobs Created</p>
                                {stats.advisor_performance.map((a: any, i: number) => (
                                    <div key={a.name} className="flex items-center gap-3">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                        <span className="flex-1 text-sm text-gray-700 truncate">{a.name}</span>
                                        <span className="text-sm font-bold text-gray-900">{a.jobs_created}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
                        <Link href="/dashboard/invoices" className="text-xs font-medium text-red-600 hover:text-red-800">View All →</Link>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="text-left py-2.5 px-4 rounded-l-xl text-xs font-medium">Invoice</th>
                                        <th className="text-left py-2.5 px-4 text-xs font-medium">Customer</th>
                                        <th className="text-left py-2.5 px-4 text-xs font-medium">Amount</th>
                                        <th className="text-left py-2.5 px-4 rounded-r-xl text-xs font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recent_invoices?.map((inv: any) => (
                                        <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                <Link href={`/dashboard/invoices/${inv.id}`} className="hover:text-red-600 transition-colors">
                                                    {inv.invoice_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{inv.job_card?.customer_name ?? '—'}</td>
                                            <td className="py-3 px-4 font-semibold">GH₵{Number(inv.total).toLocaleString()}</td>
                                            <td className="py-3 px-4"><StatusBadge status={inv.status} type="invoice" /></td>
                                        </tr>
                                    ))}
                                    {!stats?.recent_invoices?.length && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">No recent activity</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
