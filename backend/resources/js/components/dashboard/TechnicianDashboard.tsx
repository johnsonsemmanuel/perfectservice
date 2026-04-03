import { Link } from '@inertiajs/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, CheckCircle, Clock, Car, Calendar, Play, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function TechnicianDashboard({ stats, user }: { stats: any; user: any }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.patch(`/job-cards/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast('success', 'Status updated');
        },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Could not update status'),
    });

    const statCards = [
        { title: 'My Active Jobs', value: stats?.counts?.active_jobs ?? 0, icon: ClipboardList, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', highlight: true },
        { title: 'Completed Today', value: stats?.counts?.completed_today ?? 0, icon: CheckCircle, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
        { title: 'Total Completed', value: stats?.counts?.total_completed ?? 0, icon: Clock, iconBg: 'bg-gray-50', iconColor: 'text-gray-600' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Technician Portal</h2>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
                </div>
                <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2 w-fit">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.title} className={`bg-white rounded-2xl p-5 hover:shadow-md transition-shadow ${s.highlight ? 'ring-2 ring-blue-500 shadow-md' : 'border border-gray-100'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-sm font-medium text-gray-500">{s.title}</p>
                                <div className={`p-2 rounded-xl ${s.iconBg}`}><Icon className={`w-4 h-4 ${s.iconColor}`} /></div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{s.value}</h3>
                        </div>
                    );
                })}
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">My Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Mobile */}
                    <div className="block sm:hidden space-y-3">
                        {stats?.recent_job_cards?.map((job: any) => (
                            <div key={job.id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Car className="w-4 h-4 text-gray-400" /> {job.vehicle_number}
                                        </p>
                                        <p className="text-sm text-gray-500">{job.vehicle_make} {job.vehicle_model}</p>
                                    </div>
                                    <StatusBadge status={job.status} type="job" />
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    {job.status === 'open' && (
                                        <button onClick={() => updateStatus.mutate({ id: job.id, status: 'in_progress' })}
                                            disabled={updateStatus.isPending}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                            {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                            Start Job
                                        </button>
                                    )}
                                    {job.status === 'in_progress' && (
                                        <button onClick={() => updateStatus.mutate({ id: job.id, status: 'completed' })}
                                            disabled={updateStatus.isPending}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                            {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                            Mark Complete
                                        </button>
                                    )}
                                    <Link href={`/dashboard/job-cards/${job.id}`}
                                        className="flex-1 flex items-center justify-center py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {!stats?.recent_job_cards?.length && (
                            <p className="text-center text-gray-400 text-sm py-8">No active jobs assigned to you.</p>
                        )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="py-3 px-4 rounded-l-xl text-xs font-medium">Vehicle</th>
                                    <th className="py-3 px-4 text-xs font-medium">Customer</th>
                                    <th className="py-3 px-4 text-xs font-medium">Status</th>
                                    <th className="py-3 px-4 text-xs font-medium">Date</th>
                                    <th className="py-3 px-4 rounded-r-xl text-xs font-medium text-right">Quick Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_job_cards?.map((job: any) => (
                                    <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-lg bg-gray-100"><Car className="w-3.5 h-3.5 text-gray-500" /></div>
                                                <div>
                                                    <div>{job.vehicle_number}</div>
                                                    <div className="text-xs text-gray-400">{job.vehicle_make} {job.vehicle_model}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{job.customer?.name ?? job.customer_name}</td>
                                        <td className="py-3 px-4"><StatusBadge status={job.status} type="job" /></td>
                                        <td className="py-3 px-4 text-gray-400 text-xs">{new Date(job.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {job.status === 'open' && (
                                                    <button onClick={() => updateStatus.mutate({ id: job.id, status: 'in_progress' })}
                                                        disabled={updateStatus.isPending}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                        <Play className="w-3 h-3" /> Start
                                                    </button>
                                                )}
                                                {job.status === 'in_progress' && (
                                                    <button onClick={() => updateStatus.mutate({ id: job.id, status: 'completed' })}
                                                        disabled={updateStatus.isPending}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                                        <Check className="w-3 h-3" /> Complete
                                                    </button>
                                                )}
                                                <Link href={`/dashboard/job-cards/${job.id}`}
                                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!stats?.recent_job_cards?.length && (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No active jobs assigned to you.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
