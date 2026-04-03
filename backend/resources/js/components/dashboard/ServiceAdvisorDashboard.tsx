import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, CheckCircle, Clock, Plus, Car, Calendar, FileText, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#dc2626', '#f59e0b', '#10b981'];

export function ServiceAdvisorDashboard({ stats, user }: { stats: any; user: any }) {
    const statCards = [
        { title: "Today's Jobs", value: stats?.counts?.today_jobs ?? 0, icon: ClipboardList, iconBg: 'bg-red-50', iconColor: 'text-red-600', highlight: true },
        { title: 'In Progress', value: stats?.counts?.in_progress ?? 0, icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
        { title: 'Ready to Invoice', value: stats?.counts?.completed_pending_invoice ?? 0, icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    ];

    const chartData = [
        { name: 'New/Open', value: stats?.counts?.today_jobs ?? 0 },
        { name: 'In Progress', value: stats?.counts?.in_progress ?? 0 },
        { name: 'Completed', value: stats?.counts?.completed_pending_invoice ?? 0 },
    ].filter(d => d.value > 0);

    const total = chartData.reduce((s, d) => s + d.value, 0);

    return (
        <div className="space-y-6">
            {/* Header with prominent CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Service Desk</h2>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                    <Link href="/dashboard/job-cards/create"
                        className="flex items-center gap-2 h-10 px-5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95">
                        <Plus className="h-4 w-4" /> New Job Card
                    </Link>
                </div>
            </div>

            {/* Quick action banner when jobs are ready to invoice */}
            {(stats?.counts?.completed_pending_invoice ?? 0) > 0 && (
                <Link href="/dashboard/job-cards?status=completed"
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-4 hover:bg-emerald-100 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                            <FileText className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-emerald-900">
                                {stats.counts.completed_pending_invoice} job{stats.counts.completed_pending_invoice > 1 ? 's' : ''} ready to invoice
                            </p>
                            <p className="text-xs text-emerald-600">Click to view and create invoices</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </Link>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.title} className={`bg-white rounded-2xl p-5 hover:shadow-md transition-shadow ${s.highlight ? 'ring-2 ring-red-600 shadow-md' : 'border border-gray-100'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">{s.title}</p>
                                <div className={`p-2 rounded-xl ${s.iconBg}`}><Icon className={`w-4 h-4 ${s.iconColor}`} /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{s.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut */}
                <Card className="hidden lg:block border-0 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Job Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {total === 0 ? (
                            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No active jobs</div>
                        ) : (
                            <>
                                <div className="relative w-full h-[160px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                                                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v: any) => [v, 'Jobs']} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-xs text-gray-400">Active</p>
                                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {chartData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                                <span className="text-gray-600">{d.name}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Job Cards */}
                <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Job Cards</CardTitle>
                        <Link href="/dashboard/job-cards" className="text-xs font-medium text-red-600 hover:text-red-800">View All →</Link>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile */}
                        <div className="block sm:hidden space-y-3">
                            {stats?.recent_job_cards?.map((job: any) => (
                                <Link key={job.id} href={`/dashboard/job-cards/${job.id}`}>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 hover:bg-gray-100 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                                    <Car className="w-4 h-4 text-gray-400" /> {job.vehicle_number}
                                                </p>
                                                <p className="text-sm text-gray-500">{job.customer?.name ?? job.customer_name}</p>
                                            </div>
                                            <StatusBadge status={job.status} type="job" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {!stats?.recent_job_cards?.length && <p className="text-center text-gray-400 text-sm py-4">No recent jobs</p>}
                        </div>

                        {/* Desktop */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="text-left py-2.5 px-4 rounded-l-xl text-xs font-medium">Vehicle</th>
                                        <th className="text-left py-2.5 px-4 text-xs font-medium">Customer</th>
                                        <th className="text-left py-2.5 px-4 text-xs font-medium">Date</th>
                                        <th className="text-left py-2.5 px-4 rounded-r-xl text-xs font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recent_job_cards?.map((job: any) => (
                                        <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                <Link href={`/dashboard/job-cards/${job.id}`} className="hover:text-red-600 flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-gray-100"><Car className="w-3.5 h-3.5 text-gray-500" /></div>
                                                    <div>
                                                        <div>{job.vehicle_number}</div>
                                                        <div className="text-xs text-gray-400">{job.vehicle_make} {job.vehicle_model}</div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{job.customer?.name ?? job.customer_name}</td>
                                            <td className="py-3 px-4 text-gray-400 text-xs">{new Date(job.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4"><StatusBadge status={job.status} type="job" /></td>
                                        </tr>
                                    ))}
                                    {!stats?.recent_job_cards?.length && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">No recent job cards.</td></tr>
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
