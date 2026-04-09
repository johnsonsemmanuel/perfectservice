import DashboardLayout from '@/components/layout/DashboardLayout';


import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, Eye, FileText, ClipboardList, Calendar } from 'lucide-react';
import { useState } from 'react';
import { TableSkeleton } from '@/components/ui/table-skeleton';


export default function JobCardsPage() {
    const [search, setSearch] = useState('');

    const { data: jobCardsResponse, isLoading, isError } = useQuery({
        queryKey: ['job-cards', search],
        queryFn: async () => {
            const res = await api.get('/job-cards', { params: { search } });
            return res.data;
        },
    });

    const jobCards = jobCardsResponse?.data || [];

    if (isError) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <ClipboardList className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-gray-900 font-semibold">Failed to load job cards</p>
                <p className="text-sm text-gray-400 mt-1">Check your connection and try refreshing the page.</p>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Cards</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track service orders and vehicle history.</p>
                </div>
                <Link href="/dashboard/job-cards/create">
                    <Button className="w-full sm:w-auto bg-black hover:bg-gray-900 shadow-lg shadow-gray-900/10">
                        <Plus className="w-4 h-4 mr-2" />
                        New Job Card
                    </Button>
                </Link>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by job #, customer, or vehicle..."
                        className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : jobCards.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No job cards found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search.</p>
                    </div>
                ) : (
                    jobCards.map((job: any) => (
                        <Card key={job.id} className="border-gray-100 shadow-sm overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Job #{job.job_number}</div>
                                        <div className="font-semibold text-lg text-red-900">{job.vehicle_number}</div>
                                        <div className="text-sm text-gray-500">{job.vehicle_make} {job.vehicle_model}</div>
                                    </div>
                                    <StatusBadge status={job.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Customer</div>
                                        <div className="text-sm font-medium text-gray-900">{job.customer?.name || job.customer_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 mb-1">Date</div>
                                        <div className="text-sm text-gray-700 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Link href={`/dashboard/job-cards/${job.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full text-red-700 border-red-100 bg-red-50/50 hover:bg-red-50">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </Button>
                                    </Link>
                                    {job.status === 'completed' && !job.invoice && (
                                        <Link href={`/dashboard/invoices/create?job_card_id=${job.id}`}>
                                            <Button variant="outline" className="w-10 px-0 text-emerald-600 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block border-gray-100 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Job #</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Vehicle</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Technician</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="p-4">
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ) : jobCards.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <ClipboardList className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No job cards found</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                                    {search ? 'Try adjusting your search terms.' : 'Create your first job card to get started with service tracking.'}
                                                </p>
                                                {!search && (
                                                    <Link href="/dashboard/job-cards/create">
                                                        <Button variant="outline" className="mt-4">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Create Job Card
                                                        </Button>
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    jobCards.map((job: any) => (
                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-red-900">{job.job_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{job.vehicle_number}</div>
                                                <div className="text-xs text-gray-500">{job.vehicle_make} {job.vehicle_model}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{job.customer?.name || job.customer_name}</div>
                                                <div className="text-xs text-gray-500">{job.customer?.phone || job.customer_phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {job.technician ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs font-medium">
                                                            {job.technician.charAt(0)}
                                                        </div>
                                                        {job.technician}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={job.status} />
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(job.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/dashboard/job-cards/${job.id}`}>
                                                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {job.status === 'completed' && !job.invoice && (
                                                        <Link href={`/dashboard/invoices/create?job_card_id=${job.id}`}>
                                                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-emerald-100 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 hover:border-emerald-200 transition-colors" title="Create Invoice">
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </DashboardLayout>
    );
}
