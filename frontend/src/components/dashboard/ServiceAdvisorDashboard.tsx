'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, CheckCircle, Clock, Plus, Car, Calendar } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DONUT_COLORS = ['#dc2626', '#f59e0b', '#10b981']; // Red, Amber, Emerald

export function ServiceAdvisorDashboard({ stats, user }: { stats: any, user: any }) {
    const statCards = [
        {
            title: "Today's Jobs",
            value: stats.counts?.today_jobs ?? 0,
            icon: ClipboardList,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-600',
            highlight: true,
        },
        {
            title: 'In Progress',
            value: stats.counts?.in_progress ?? 0,
            icon: Clock,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            title: 'Ready to Invoice',
            value: stats.counts?.completed_pending_invoice ?? 0,
            icon: CheckCircle,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
    ];

    // Data for Donut Chart
    const jobStatusData = [
        { name: 'New/Pending', value: stats.counts?.today_jobs ?? 0 },
        { name: 'In Progress', value: stats.counts?.in_progress ?? 0 },
        { name: 'Completed', value: stats.counts?.completed_pending_invoice ?? 0 },
    ].filter(item => item.value > 0);

    // If no data, show placeholders
    const chartData = jobStatusData.length > 0 ? jobStatusData : [{ name: 'No Data', value: 1 }];
    const chartColors = jobStatusData.length > 0 ? DONUT_COLORS : ['#e5e7eb'];

    const totalactive = (stats.counts?.today_jobs ?? 0) + (stats.counts?.in_progress ?? 0) + (stats.counts?.completed_pending_invoice ?? 0);

    return (
        <div className="space-y-6 -mt-4">
            {/* Header Area matching Admin Style */}
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
                    <Link
                        href="/dashboard/job-cards/create"
                        className="flex items-center gap-2 h-9 px-4 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-900 transition-colors shadow-lg shadow-gray-900/10"
                    >
                        <Plus className="h-4 w-4" />
                        New Job Card
                    </Link>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
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
                                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Donut Chart Section - Hidden on mobile, visible on lg screens */}
                <Card className="hidden lg:block border-0 shadow-sm lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">Job Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="relative w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => [value, 'Jobs']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)', fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-xs text-gray-400">Total Active</p>
                                <p className="text-2xl font-bold text-gray-900">{totalactive}</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {jobStatusData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DONUT_COLORS[index] }} />
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-semibold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Job Cards Table/List */}
                <Card className="border-0 shadow-sm lg:col-span-2">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Job Cards</CardTitle>
                        <Link href="/dashboard/job-cards" className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
                            View All →
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile Card View */}
                        <div className="block sm:hidden space-y-4">
                            {stats?.recent_job_cards?.map((job: any) => (
                                <div key={job.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                <Car className="w-4 h-4 text-gray-500" />
                                                {job.vehicle_number}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-0.5">{job.customer_name}</div>
                                        </div>
                                        <StatusBadge status={job.status} type="job" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
                                        <span>{job.vehicle_make} {job.vehicle_model}</span>
                                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.recent_job_cards?.length) && (
                                <div className="text-center text-gray-400 text-sm py-4">No recent jobs</div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="text-left py-3 px-4 rounded-l-xl font-medium text-xs">Vehicle</th>
                                        <th className="text-left py-3 px-4 font-medium text-xs">Customer</th>
                                        <th className="text-left py-3 px-4 font-medium text-xs">Details</th>
                                        <th className="text-left py-3 px-4 font-medium text-xs">Date</th>
                                        <th className="text-left py-3 px-4 rounded-r-xl font-medium text-xs">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recent_job_cards?.map((job: any) => (
                                        <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                                                        <Car className="w-3.5 h-3.5" />
                                                    </div>
                                                    {job.vehicle_number}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{job.customer_name}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{job.vehicle_make} {job.vehicle_model}</td>
                                            <td className="py-3 px-4 text-gray-500 text-xs">{new Date(job.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4"><StatusBadge status={job.status} type="job" /></td>
                                        </tr>
                                    ))}
                                    {(!stats?.recent_job_cards?.length) && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-400">No recent job cards found.</td>
                                        </tr>
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
