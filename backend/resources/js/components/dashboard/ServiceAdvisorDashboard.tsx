import { Link } from '@inertiajs/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, CheckCircle, Clock, Plus, Car, FileText, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const STATUS_COLORS = ['#dc2626', '#f59e0b', '#10b981'];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

export function ServiceAdvisorDashboard({ stats, user }: { stats: any; user: any }) {
    const chartData = [
        { name: "Today's Jobs", value: stats?.counts?.today_jobs ?? 0 },
        { name: 'In Progress', value: stats?.counts?.in_progress ?? 0 },
        { name: 'Ready to Invoice', value: stats?.counts?.completed_pending_invoice ?? 0 },
    ].filter(d => d.value > 0);

    const total = chartData.reduce((s, d) => s + d.value, 0);

    const statCards = [
        { title: "Today's Jobs", value: stats?.counts?.today_jobs ?? 0, icon: ClipboardList, iconBg: 'bg-red-50', iconColor: 'text-red-600', accent: true },
        { title: 'In Progress', value: stats?.counts?.in_progress ?? 0, icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', accent: false },
        { title: 'Ready to Invoice', value: stats?.counts?.completed_pending_invoice ?? 0, icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', accent: false },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Good {getGreeting()}, {user?.name?.split(' ')[0]}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link href="/dashboard/job-cards/create"
                    className="inline-flex items-center gap-2 h-9 px-4 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors w-fit">
                    <Plus className="w-3.5 h-3.5" /> New Job Card
                </Link>
            </div>

            {(stats?.counts?.completed_pending_invoice ?? 0) > 0 && (
                <Link href="/dashboard/job-cards?status=completed"
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 hover:bg-emerald-100/70 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
                            <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-emerald-900">
                                {stats.counts.completed_pending_invoice} job{stats.counts.completed_pending_invoice > 1 ? 's' : ''} ready to invoice
                            </p>
                            <p className="text-xs text-emerald-600 mt-0.5">Tap to view and create invoices</p>
                        </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.title} className={`relative bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${s.accent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'}`}>
                            {s.accent && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl" />}
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-xs font-medium text-gray-500">{s.title}</p>
                                <div className={`p-2 rounded-xl ${s.iconBg}`}><Icon className={`w-4 h-4 ${s.iconColor}`} /></div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Job Status</h3>
                    </div>
                    <div className="p-5">
                        {total === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-gray-300 gap-2">
                                <ClipboardList className="w-8 h-8" />
                                <p className="text-xs">No active jobs</p>
                            </div>
                        ) : (
                            <>
                                <div className="relative h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                                                {chartData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(v: any) => [v, 'Jobs']} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-xs text-gray-400">Active</p>
                                        <p className="text-2xl font-bold text-gray-900">{total}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-3">
                                    {chartData.map((d, i) => (
                                        <div key={d.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[i] }} />
                                                <span className="text-xs text-gray-600">{d.name}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-900">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Job Cards</h3>
                        <Link href="/dashboard/job-cards" className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700">
                            View all <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    {['Vehicle', 'Customer', 'Date', 'Status'].map((h, i) => (
                                        <th key={h} className={`py-2.5 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 ${i === 0 ? 'pl-6' : ''} ${i === 3 ? 'pr-6' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_job_cards?.map((job: any) => (
                                    <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pl-6 pr-4">
                                            <Link href={`/dashboard/job-cards/${job.id}`} className="flex items-center gap-2.5 group">
                                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                    <Car className="w-3.5 h-3.5 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">{job.vehicle_number}</p>
                                                    <p className="text-xs text-gray-400">{job.vehicle_make} {job.vehicle_model}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">{job.customer?.name ?? job.customer_name}</td>
                                        <td className="py-3 px-4 text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 pr-6"><StatusBadge status={job.status} type="job" /></td>
                                    </tr>
                                ))}
                                {!stats?.recent_job_cards?.length && (
                                    <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-400">No recent job cards</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
