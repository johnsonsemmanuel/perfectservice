'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle, FileText, Printer, Calendar, User, Phone, Car, MessageSquare, Edit2, Save, X } from 'lucide-react';
import Link from 'next/link';

import { DetailSkeleton } from '@/components/dashboard/DetailSkeleton';

export default function JobCardDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = params.id;
    const { user } = useAuth();
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isEditingFeedback, setIsEditingFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const { data: job, isLoading } = useQuery({
        queryKey: ['job-card', id],
        queryFn: async () => {
            const res = await api.get(`/job-cards/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const updateStatus = useMutation({
        mutationFn: async (status: string) => {
            await api.patch(`/job-cards/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-card', id] });
        },
    });

    const submitFeedback = useMutation({
        mutationFn: async () => {
            await api.post(`/job-cards/${id}/feedback`, { feedback: feedbackText });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-card', id] });
            setIsEditingFeedback(false);
        },
    });

    if (isLoading) return <DetailSkeleton />;
    if (!job) return <div className="p-8 text-center text-red-500">Job card not found.</div>;

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'invoiced': return 'secondary';
            case 'open': return 'warning';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="self-start sm:self-auto pl-0 sm:pl-3">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Job #{job.job_number}
                            <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize shadow-none">
                                {job.status.replace('_', ' ')}
                            </Badge>
                        </h1>
                        <p className="text-sm text-gray-500 hidden sm:block">View and manage service details</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {/* Actions based on status */}
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                setIsDownloadingPdf(true);
                                const response = await api.get(`/job-cards/${job.id}/pdf`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `JobCard_${job.job_number}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (error) {
                                console.error('Failed to download PDF', error);
                                alert('Failed to download PDF');
                            } finally {
                                setIsDownloadingPdf(false);
                            }
                        }}
                        disabled={isDownloadingPdf}
                        className="flex-1 sm:flex-none"
                    >
                        {isDownloadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                        PDF
                    </Button>

                    {job.status === 'in_progress' && (
                        <Button
                            onClick={() => updateStatus.mutate('completed')}
                            disabled={updateStatus.isPending}
                            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                        >
                            {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Complete
                        </Button>
                    )}

                    {job.status === 'open' && (
                        <Button
                            onClick={() => updateStatus.mutate('in_progress')}
                            disabled={updateStatus.isPending}
                            className="flex-1 sm:flex-none bg-black hover:bg-gray-800"
                        >
                            {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Start Job
                        </Button>
                    )}

                    {job.status === 'completed' && !job.invoice && (
                        <Link href={`/dashboard/invoices/create?job_card_id=${job.id}`} className="flex-1 sm:flex-none">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <FileText className="w-4 h-4 mr-2" />
                                Invoice
                            </Button>
                        </Link>
                    )}

                    {job.invoice && (
                        <Link href={`/dashboard/invoices/${job.invoice.id}`} className="flex-1 sm:flex-none">
                            <Button variant="outline" className="w-full">
                                <FileText className="w-4 h-4 mr-2" />
                                Invoice
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Manager Feedback Section */}
            {(job.manager_feedback || user?.role === 'manager') && (
                <Card className="border-yellow-200 bg-yellow-50/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-yellow-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Manager Feedback
                            </div>
                            {user?.role === 'manager' && !isEditingFeedback && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                                    onClick={() => {
                                        setFeedbackText(job.manager_feedback || '');
                                        setIsEditingFeedback(true);
                                    }}
                                >
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    {job.manager_feedback ? 'Edit' : 'Add Note'}
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditingFeedback ? (
                            <div className="space-y-3">
                                <Textarea
                                    className="w-full min-h-[100px] p-3 rounded-md border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    placeholder="Enter instructions for the team..."
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditingFeedback(false)}
                                        className="text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => submitFeedback.mutate()}
                                        disabled={submitFeedback.isPending}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                                    >
                                        {submitFeedback.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-yellow-900 whitespace-pre-wrap">
                                {job.manager_feedback || <span className="italic text-yellow-700/50">No feedback provided yet.</span>}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            Vehicle Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">Vehicle No</span>
                            <span className="font-semibold text-gray-900">{job.vehicle_number}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">Make/Model</span>
                            <span className="font-medium">{job.vehicle_make} {job.vehicle_model}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">Technician</span>
                            <span className="font-medium text-blue-600">{job.technician || 'Unassigned'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium">{job.customer?.name || job.customer_name}</span>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">Phone</span>
                            <div className="flex items-center gap-1 font-medium">
                                <Phone className="w-3 h-3 text-gray-400" />
                                {job.customer?.phone || job.customer_phone}
                            </div>
                        </div>
                        <div className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-500">Created</span>
                            <div className="flex items-center gap-1 font-medium">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                {new Date(job.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Service Items */}
            <Card className="border-gray-100 shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                    <CardTitle className="text-base">Service Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Mobile List View */}
                    <div className="block sm:hidden divide-y divide-gray-100">
                        {job.items.map((item: any, idx: number) => (
                            <div key={idx} className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="font-medium text-gray-900">{item.service?.name}</div>
                                    <div className="font-semibold text-gray-900">GH₵{parseFloat(item.agreed_price).toFixed(2)}</div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{item.service?.is_fixed ? 'Fixed Price' : 'Variable'}</span>
                                    {item.notes && <span className="italic">{item.notes}</span>}
                                </div>
                            </div>
                        ))}
                        <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
                            <div className="font-bold text-gray-900">Total Estimate</div>
                            <div className="font-bold text-lg text-red-700">
                                GH₵{job.items.reduce((sum: number, item: any) => sum + parseFloat(item.agreed_price), 0).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Notes</th>
                                    <th className="px-6 py-4 text-right">Agreed Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {job.items.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.service?.name}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            <Badge variant="outline" className="font-normal">{item.service?.is_fixed ? 'Fixed' : 'Variable'}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 italic text-xs max-w-xs truncate">{item.notes || '-'}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">GH₵{parseFloat(item.agreed_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50/50 font-bold border-t border-gray-200">
                                    <td colSpan={3} className="px-6 py-4 text-right text-gray-600">Total Estimate</td>
                                    <td className="px-6 py-4 text-right text-red-700 text-lg">
                                        GH₵{job.items.reduce((sum: number, item: any) => sum + parseFloat(item.agreed_price), 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
