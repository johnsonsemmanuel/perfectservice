import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, usePage } from '@inertiajs/react';
import api from '@/lib/axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateInvoice() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // job_card_id comes from query string — Inertia passes it via usePage props or we read from URL
    const url = new URL(window.location.href);
    const jobCardId = url.searchParams.get('job_card_id');

    const { data: job, isLoading } = useQuery({
        queryKey: ['job-card', jobCardId],
        queryFn: async () => (await api.get(`/job-cards/${jobCardId}`)).data,
        enabled: !!jobCardId,
    });

    const createInvoice = useMutation({
        mutationFn: async () => (await api.post('/invoices', { job_card_id: jobCardId })).data,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['job-cards'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast('success', 'Invoice created!');
            router.visit(`/dashboard/invoices/${data.invoice.id}`);
        },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Could not create invoice.'),
    });

    if (!jobCardId) return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-500 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> No job card specified.
            </div>
        </DashboardLayout>
    );

    if (isLoading) return (
        <DashboardLayout>
            <div className="p-8 text-center text-gray-500">Loading job card details...</div>
        </DashboardLayout>
    );

    if (!job) return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-500">Job card not found.</div>
        </DashboardLayout>
    );

    const subtotal = job.items?.reduce((s: number, i: any) => s + parseFloat(i.agreed_price) * (i.quantity || 1), 0) ?? 0;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="pl-0">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Issue Invoice</h1>
                        <p className="text-sm text-gray-500">Job Card #{job.job_number}</p>
                    </div>
                </div>

                <Card className="border-gray-100 shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-50">
                        <CardTitle className="text-base">Invoice Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Customer</p>
                                <p className="font-semibold text-gray-900">{job.customer?.name || job.customer_name}</p>
                                <p className="text-gray-500 text-xs">{job.customer?.phone || job.customer_phone}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs text-gray-400 uppercase font-semibold">Vehicle</p>
                                <p className="font-semibold text-gray-900">{job.vehicle_number}</p>
                                <p className="text-gray-500 text-xs">{job.vehicle_make} {job.vehicle_model}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Service</th>
                                        <th className="px-4 py-3 text-center">Qty</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {job.items?.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{item.service?.name}</p>
                                                {item.notes && <p className="text-xs text-gray-400">{item.notes}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-500">{item.quantity || 1}</td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                GH₵{(parseFloat(item.agreed_price) * (item.quantity || 1)).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 font-bold border-t border-gray-200">
                                        <td colSpan={2} className="px-4 py-3 text-right text-gray-600">Total</td>
                                        <td className="px-4 py-3 text-right text-red-600 text-lg">
                                            GH₵{subtotal.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                            <Button onClick={() => createInvoice.mutate()} disabled={createInvoice.isPending} className="min-w-36">
                                {createInvoice.isPending
                                    ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    : <CheckCircle className="w-4 h-4 mr-2" />
                                }
                                Issue Invoice
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
