'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function CreateInvoicePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const jobCardId = searchParams.get('job_card_id');

    const { data: job, isLoading } = useQuery({
        queryKey: ['job-card', jobCardId],
        queryFn: async () => {
            const res = await api.get(`/job-cards/${jobCardId}`);
            return res.data;
        },
        enabled: !!jobCardId,
    });

    const createInvoice = useMutation({
        mutationFn: async () => {
            const res = await api.post('/invoices', { job_card_id: jobCardId });
            return res.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['job-cards'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast('success', 'Invoice Created!', 'The invoice has been generated successfully.');
            router.push(`/dashboard/invoices/${data.invoice.id}`);
        },
        onError: (err: any) => {
            toast('error', 'Invoice Failed', err.response?.data?.message || 'Could not create invoice.');
        },
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!job) return <div className="p-8 text-center text-red-500">Job card not found.</div>;

    const subtotal = job.items.reduce((sum: number, item: any) => sum + parseFloat(item.agreed_price), 0);
    // Assuming default tax is 0 for draft, backend calculates actual tax. 
    // We can show estimate.

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Invoice Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-gray-500">Customer</p>
                            <p className="font-medium">{job.customer_name}</p>
                            <p className="text-gray-500 text-xs">{job.customer_phone}</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-gray-500">Vehicle</p>
                            <p className="font-medium">{job.vehicle_number}</p>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {job.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{item.service?.name}</p>
                                            <p className="text-xs text-gray-500">{item.notes}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            GH₵{parseFloat(item.agreed_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 font-bold">
                                    <td className="px-4 py-3 text-right">Total Payable</td>
                                    <td className="px-4 py-3 text-right text-lg text-primary">
                                        GH₵{subtotal.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button
                            onClick={() => createInvoice.mutate()}
                            disabled={createInvoice.isPending}
                            className="w-40"
                        >
                            {createInvoice.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Issue Invoice
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
