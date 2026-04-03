import { Link } from '@inertiajs/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { StatusBadge } from '@/components/ui/status-badge';
import { ClipboardList, CheckCircle, Clock, Car, Play, Check, Loader2, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-2xl border border-gray-200/60 shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

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
        { title: 'My Active Jobs', value: stats?.counts?.active_jobs ?? 0, icon: ClipboardList, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', accent: true },
        { title: 'Completed Today', value: stats?.counts?.completed_today ?? 0, icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', accent: false },
        { title: 'Total Completed', value: stats?.counts?.total_completed ?? 0, icon: Clock, iconBg: 'bg-gray-100', iconColor: 'text-gray-600', accent: false },
    ];

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Good {getGreeting()}, {user?.name?.split(' ')[0]}</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.title} className={`relative bg-white rounded-2xl p-5 border transition-shadow hover:shadow-md ${
                            s.accent ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'
                        }`}>
                            {s.accent && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl" />}
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-[12px] font-medium text-gray-500">{s.title}</p>
                                <div className={`p-2 rounded-xl ${s.iconBg}`}><Icon className={`w-4 h-4 ${s.iconColor}`} /></div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Active jobs */}
            <Section>
                <SectionHeader title="My Active Jobs" action={
                    <Link href="/dashboard/job-cards" className="flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700">
                        View all <ArrowUpRight className="w-3 h-3" />
                    </Link>
                } />

                {/* Mobile cards */}
                <div className="block sm:hidden p-4 space-y-3">
                    {stats?.recent_job_cards?.map((job: any) => (
                        <div key={job.id} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Car className="w-4 h-4 text-gray-400" /> {job.vehicle_number}
                                    </p>
                                    <p className="text-[12px] text-gray-500 mt-0.5">{job.vehicle_make} {job.vehicle_model}</p>
                                </div>
                                <StatusBadge status={job.status} type="job" />
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                {job.status === 'open' && (
                                    <button onClick={() => updateStatus.mutate({ id: job.id, status: 'in_progress' })}
                                        disabled={updateStatus.isPending}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                        {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        Start
                                    </button>
                                )}
                                {job.status === 'in_progress' && (
                                    <button onClick={() => updateStatus.mutate({ id: job.id, status: 'completed' })}
                                        disabled={updateStatus.isPending}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white text-[12px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                        {updateStatus.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                        Complete
                                    </button>
                                )}
                                <Link href={`/dashboard/job-cards/${job.id}`}
                                    className="flex-1 flex items-center justify-center py-2 border border-gray-200 text-gray-600 text-[12px] font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}
                    {!stats?.recent_job_cards?.length && (
                        <p className="text-center text-[13px] text-gray-400 py-8">No active jobs assigned to you</p>
                    )}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                {['Vehicle', 'Customer', 'Status', 'Date', 'Action'].map((h, i) => (
                                    <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50 ${i === 0 ? 'pl-6' : ''} ${i === 4 ? 'pr-6 text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recent_job_cards?.map((job: any) => (
                                <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3 pl-6 pr-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                                <Car className="w-3.5 h-3.5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{job.vehicle_number}</p>
                                                <p className="text-[11px] text-gray-400">{job.vehicle_make} {job.vehicle_model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">{job.customer?.name ?? job.customer_name}</td>
                                    <td className="py-3 px-4"><StatusBadge status={job.status} type="job" /></td>
                                    <td className="py-3 px-4 text-[12px] text-gray-400">{new Date(job.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {job.status === 'open' && (
                                                <button onClick={() => updateStatus.mutate({ id: job.id, status: 'in_progress' })}
                                                    disabled={updateStatus.isPending}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                                    <Play className="w-3 h-3" /> Start
                                                </button>
                                            )}
                                            {job.status === 'in_progress' && (
                                                <button onClick={() => updateStatus.mutate({ id: job.id, status: 'completed' })}
                                                    disabled={updateStatus.isPending}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                                    <Check className="w-3 h-3" /> Complete
                                                </button>
                                            )}
                                            <Link href={`/dashboard/job-cards/${job.id}`}
                                                className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!stats?.recent_job_cards?.length && (
                                <tr><td colSpan={5} className="py-10 text-center text-[13px] text-gray-400">No active jobs assigned to you</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
}
