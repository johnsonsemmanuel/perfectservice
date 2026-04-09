import DashboardLayout from '@/components/layout/DashboardLayout';


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Printer, Banknote, AlertCircle, Ban } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { DetailSkeleton } from '@/components/dashboard/DetailSkeleton';

export default function InvoiceDetailPage() {
    
    ;
    const queryClient = useQueryClient();
    const { id } = usePage().props as any;
    const { user } = useAuth();

    // Local state for payment form
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [error, setError] = useState('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

    const { data: invoice, isLoading } = useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            const res = await api.get(`/invoices/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            const map: any = {};
            res.data.forEach((s: any) => map[s.key] = s.value);
            return map;
        },
    });

    const recordPayment = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post(`/invoices/${id}/payments`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            setShowPaymentForm(false);
            setPaymentAmount('');
            setPaymentReference('');
            setError('');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to record payment.');
        }
    });

    const voidInvoice = useMutation({
        mutationFn: async () => {
            const res = await api.post(`/invoices/${id}/void`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Failed to void invoice.');
        }
    });

    const handlePrint = () => {
        window.print();
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        recordPayment.mutate({
            amount: parseFloat(paymentAmount),
            method: paymentMethod,
            reference: paymentReference
        });
    };

    if (isLoading) return (
        <DashboardLayout>
            <DetailSkeleton />
        </DashboardLayout>
    );
    if (!invoice) return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-500">Invoice not found.</div>
        </DashboardLayout>
    );

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'void': return 'destructive';
            default: return 'warning';
        }
    };

    const isPaid = invoice.status === 'paid';
    const isVoid = invoice.status === 'void';
    const canManage = user?.role === 'manager';

    return (
        <DashboardLayout>
        <div className="w-full space-y-6 print:max-w-none print:p-0">
            {/* Header - Hide on print */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {invoice.invoice_number}
                            <Badge variant={getStatusBadgeVariant(invoice.status)} className="capitalize">
                                {invoice.status}
                            </Badge>
                        </h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                setIsDownloadingReceipt(true);
                                const response = await api.get(`/invoices/${invoice.id}/receipt-pdf`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Receipt_${invoice.invoice_number}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (error) {
                                console.error('Failed to download receipt', error);
                                alert('Failed to download receipt');
                            } finally {
                                setIsDownloadingReceipt(false);
                            }
                        }}
                        disabled={isDownloadingReceipt}
                    >
                        {isDownloadingReceipt ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                        Receipt
                    </Button>
                    <Button
                        variant="outline"
                        onClick={async () => {
                            try {
                                setIsDownloadingPdf(true);
                                const response = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', `Invoice_${invoice.invoice_number}.pdf`);
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                            } catch (error) {
                                console.error('Failed to download invoice', error);
                                alert('Failed to download invoice');
                            } finally {
                                setIsDownloadingPdf(false);
                            }
                        }}
                        disabled={isDownloadingPdf}
                    >
                        {isDownloadingPdf ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />}
                        Invoice
                    </Button>

                    {!isPaid && !isVoid && (
                        <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                            <Banknote className="w-4 h-4 mr-2" />
                            Record Payment
                        </Button>
                    )}

                    {canManage && !isVoid && (
                        <Button variant="destructive" onClick={() => {
                            if (confirm('Are you sure you want to void this invoice? This cannot be undone.')) {
                                voidInvoice.mutate();
                            }
                        }}>
                            <Ban className="w-4 h-4 mr-2" />
                            Void
                        </Button>
                    )}
                </div>
            </div>

            {/* Payment Form */}
            {showPaymentForm && (
                <Card className="bg-red-50/50 border-red-100 print:hidden">
                    <CardHeader>
                        <CardTitle className="text-base text-red-900">Record New Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <div className="flex gap-4 items-end">
                                <div className="w-40 space-y-2">
                                    <Label>Amount (GH₵)</Label>
                                    <Input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        max={invoice.balance_due}
                                        required
                                    />
                                </div>
                                <div className="w-40 space-y-2">
                                    <Label>Method</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="momo">Mobile Money</option>
                                    </select>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label>Reference / Note</Label>
                                    <Input
                                        value={paymentReference}
                                        onChange={e => setPaymentReference(e.target.value)}
                                        placeholder="Optional transaction ID"
                                    />
                                </div>
                                <Button type="submit" disabled={recordPayment.isPending}>
                                    {recordPayment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Payment'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Invoice Layout */}
            <Card className="print:shadow-none print:border-none">
                <CardContent className="p-8 space-y-8">
                    {/* Invoice Header */}
                    <div className="flex justify-between border-b border-gray-100 pb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-primary">{settings?.business_name || 'PerfectService'}</h2>
                            <p className="text-gray-500 text-sm mt-1">Auto Servicing & POS</p>
                            <div className="mt-4 text-sm text-gray-500">
                                {settings?.business_address && <p>{settings.business_address}</p>}
                                {settings?.business_phone && <p>{settings.business_phone}</p>}
                                {settings?.business_email && <p>{settings.business_email}</p>}
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                            <p className="font-medium text-gray-600 mt-1">{invoice.invoice_number}</p>
                            <div className="mt-4 text-sm space-y-1">
                                <p><span className="text-gray-500">Date:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
                                <p><span className="text-gray-500">Ref:</span> {invoice.job_card?.job_number}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Vehicle */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h4>
                            <p className="font-bold text-gray-900">{invoice.job_card?.customer_name}</p>
                            <p className="text-sm text-gray-500">{invoice.job_card?.customer_phone}</p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle Details</h4>
                            <p className="font-bold text-gray-900">{invoice.job_card?.vehicle_number}</p>
                            <p className="text-sm text-gray-500">{invoice.job_card?.vehicle_make} {invoice.job_card?.vehicle_model}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="border rounded-lg overflow-hidden print:border-gray-200">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 print:bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Description</th>
                                    <th className="px-4 py-3 text-right text-gray-500 font-medium w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 print:divide-gray-200">
                                {invoice.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{item.description}</p>
                                            {item.notes && <p className="text-gray-500 text-xs italic">{item.notes}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            GH₵{parseFloat(item.line_total).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal:</span>
                                <span className="font-medium">GH₵{parseFloat(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            {parseFloat(invoice.discount_amount) > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount ({parseFloat(invoice.discount_percent)}%):</span>
                                    <span>-GH₵{parseFloat(invoice.discount_amount).toFixed(2)}</span>
                                </div>
                            )}
                            {parseFloat(invoice.tax_amount) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax:</span>
                                    <span>GH₵{parseFloat(invoice.tax_amount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2 mt-2">
                                <span>Total:</span>
                                <span>GH₵{parseFloat(invoice.total).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Paid:</span>
                                <span>GH₵{parseFloat(invoice.amount_paid).toFixed(2)}</span>
                            </div>
                            {parseFloat(invoice.balance_due) > 0 && (
                                <div className="flex justify-between text-sm text-red-600 font-bold border-t border-gray-100 pt-2">
                                    <span>Balance Due:</span>
                                    <span>GH₵{parseFloat(invoice.balance_due).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer / Terms */}
                    <div className="border-t border-gray-100 pt-8 text-center text-xs text-gray-500 print:mt-16 print:border-gray-300">
                        <p className="uppercase tracking-wider font-bold mb-2">Terms & Conditions</p>
                        <p>Prices are subject to inspection.</p>
                        <p>Customer-supplied parts carry no warranty.</p>
                        <p>Full payment required before vehicle release.</p>
                        <p className="mt-4">Thank you for your business!</p>
                    </div>
                </CardContent>
            </Card>
        </div>
        </DashboardLayout>
    );
}
