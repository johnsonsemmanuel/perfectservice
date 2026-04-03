

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, CheckCircle, Clock, Car, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function TechnicianDashboard({ stats, user }: { stats: any, user: any }) {
    const statCards = [
        {
            title: "My Active Jobs",
            value: stats.counts?.active_jobs ?? 0,
            icon: ClipboardList,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            highlight: true,
        },
        {
            title: 'Completed Today',
            value: stats.counts?.completed_today ?? 0,
            icon: CheckCircle,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            title: 'Total Completed',
            value: stats.counts?.total_completed ?? 0,
            icon: Clock,
            iconBg: 'bg-gray-50',
            iconColor: 'text-gray-600',
        },
    ];

    return (
        <div className="space-y-6 -mt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Technician Portal</h2>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className={`bg-white rounded-2xl p-5 transition-shadow hover:shadow-md ${stat.highlight
                                ? 'ring-2 ring-blue-600 shadow-md'
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

            {/* My Active Jobs */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">My Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Mobile Card View */}
                    <div className="block sm:hidden space-y-4">
                        {stats?.recent_job_cards?.map((job: any) => (
                            <Link href={`/dashboard/job-cards/${job.id}`} key={job.id} className="block">
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3 cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                <Car className="w-4 h-4 text-gray-500" />
                                                {job.vehicle_number}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-0.5">{job.vehicle_make} {job.vehicle_model}</div>
                                        </div>
                                        <StatusBadge status={job.status} type="job" />
                                    </div>
                                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                                        Customer: {job.customer?.name || job.customer_name}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {(!stats?.recent_job_cards?.length) && (
                            <div className="text-center text-gray-400 text-sm py-4">No active jobs assigned to you.</div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="py-3 px-4 rounded-l-xl font-medium text-xs">Vehicle</th>
                                    <th className="py-3 px-4 font-medium text-xs">Customer</th>
                                    <th className="py-3 px-4 font-medium text-xs">Status</th>
                                    <th className="py-3 px-4 font-medium text-xs">Date</th>
                                    <th className="py-3 px-4 rounded-r-xl font-medium text-xs text-right">Action</th>
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
                                                <div>
                                                    <div>{job.vehicle_number}</div>
                                                    <div className="text-xs text-gray-500">{job.vehicle_make} {job.vehicle_model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{job.customer?.name || job.customer_name}</td>
                                        <td className="py-3 px-4"><StatusBadge status={job.status} type="job" /></td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">{new Date(job.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Link
                                                href={`/dashboard/job-cards/${job.id}`}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                View Job
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recent_job_cards?.length) && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400">No active jobs assigned to you.</td>
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
