import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Printer, Banknote, Ban, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/components/ui/toast';
import { DetailSkeleton } from '@/components/dashboard/DetailSkeleton';

export default function InvoiceDetailPage() {
    const queryClient = useQueryClient();
    const { id } = usePage().props as any;
    const { user } = useAuth();
    const { toast } = useToast();

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentReference, setPaymentReference] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
    const [showVoidConfirm, setShowVoidConfirm] = useState(false);

    const { data: invoice, isLoading, isError } = useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => (await api.get(`/invoices/${id}`)).data,
        enabled: !!id,
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            const map: any = {};
            res.data.forEach((s: any) => (map[s.key] = s.value));
            return map;
        },
    });

    const recordPayment = useMutation({
        mutationFn: (data: any) => api.post(`/invoices/${id}/payments`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            setShowPaymentForm(false);
            setPaymentAmount('');
            setPaymentReference('');
            setPaymentError('');
            toast('success', 'Payment recorded');
        },
        onError: (err: any) => {
            setPaymentError(err.response?.data?.message || 'Failed to record payment.');
        },
    });

    const voidInvoice = useMutation({
        mutationFn: () => api.post(`/invoices/${id}/void`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            setShowVoidConfirm(false);
            toast('success', 'Invoice voided');
        },
        onError: (err: any) => {
            setShowVoidConfirm(false);
            toast('error', 'Failed to void', err.response?.data?.message || 'Try again');
        },
    });

    const downloadBlob = async (url: string, filename: string, setLoading: (v: boolean) => void) => {
        setLoading(true);
        try {
            const res = await api.get(url, { responseType: 'blob' });
            const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = blobUrl;
            a.setAttribute('download', filename);
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            toast('error', 'Download failed', 'Could not download the file. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        document.body.classList.add('printing-invoice');
        window.print();
        setTimeout(() => document.body.classList.remove('printing-invoice'), 500);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        recordPayment.mutate({ amount: parseFloat(paymentAmount), method: paymentMethod, reference: paymentReference });
    };

    if (isLoading) return <DashboardLayout><DetailSkeleton /></DashboardLayout>;
    if (isError) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                <p className="font-semibold text-gray-900">Failed to load invoice</p>
                <p className="text-sm text-gray-400 mt-1">Check your connection and try refreshing.</p>
            </div>
        </DashboardLayout>
    );
    if (!invoice) return (
        <DashboardLayout>
            <div className="p-8 text-center text-red-500">Invoice not found.</div>
        </DashboardLayout>
    );

    const statusVariant: Record<string, string> = { paid: 'success', void: 'destructive' };
    const isPaid = invoice.status === 'paid';
    const isVoid = invoice.status === 'void';
    const canManage = user?.role === 'manager';
    const canPay = user?.role === 'manager' || user?.role === 'cash_officer';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="pl-0">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {invoice.invoice_number}
                                <Badge variant={statusVariant[invoice.status] as any ?? 'warning'} className="capitalize text-xs">
                                    {invoice.status}
                                </Badge>
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => downloadBlob(`/invoices/${invoice.id}/receipt-pdf`, `Receipt_${invoice.invoice_number}.pdf`, setIsDownloadingReceipt)} disabled={isDownloadingReceipt}>
                            {isDownloadingReceipt ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Printer className="w-3.5 h-3.5 mr-1.5" />} Receipt
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => downloadBlob(`/invoices/${invoice.id}/pdf`, `Invoice_${invoice.invoice_number}.pdf`, setIsDownloadingPdf)} disabled={isDownloadingPdf}>
                            {isDownloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Banknote className="w-3.5 h-3.5 mr-1.5" />} PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
                        </Button>
                        {canPay && !isPaid && !isVoid && (
                            <Button size="sm" onClick={() => setShowPaymentForm(v => !v)}>
                                <Banknote className="w-3.5 h-3.5 mr-1.5" /> Record Payment
                            </Button>
                        )}
                        {canManage && !isVoid && (
                            <Button variant="destructive" size="sm" onClick={() => setShowVoidConfirm(true)}>
                                <Ban className="w-3.5 h-3.5 mr-1.5" /> Void
                            </Button>
                        )}
                    </div>
                </div>

                {/* Void confirmation */}
                {showVoidConfirm && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                        <div>
                            <p className="font-semibold text-red-900">Void this invoice?</p>
                            <p className="text-sm text-red-700 mt-0.5">This action cannot be undone. The invoice will be permanently voided.</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => setShowVoidConfirm(false)}>Cancel</Button>
                            <Button variant="destructive" size="sm" onClick={() => voidInvoice.mutate()} disabled={voidInvoice.isPending}>
                                {voidInvoice.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null} Confirm Void
                            </Button>
                        </div>
                    </div>
                )}

                {/* Payment form */}
                {showPaymentForm && (
                    <Card className="border-red-100 bg-red-50/40 print:hidden">
                        <CardHeader className="pb-3 border-b border-red-100">
                            <CardTitle className="text-sm text-red-900">Record Payment — Balance: GH₵{parseFloat(invoice.balance_due).toFixed(2)}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                {paymentError && (
                                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                                        <AlertCircle className="w-4 h-4 shrink-0" /> {paymentError}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <Label>Amount (GH₵) *</Label>
                                        <Input type="number" step="0.01" min="0.01" max={invoice.balance_due}
                                            value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} required
                                            placeholder={`Max GH₵${parseFloat(invoice.balance_due).toFixed(2)}`} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Method *</Label>
                                        <select className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-red-400"
                                            value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                            <option value="cash">Cash</option>
                                            <option value="momo">Mobile Money</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Reference</Label>
                                        <Input value={paymentReference} onChange={e => setPaymentReference(e.target.value)}
                                            placeholder="Transaction ID (optional)" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                                    <Button type="submit" size="sm" disabled={recordPayment.isPending}>
                                        {recordPayment.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle className="w-3.5 h-3.5 mr-1.5" />}
                                        Save Payment
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Payment history */}
                {invoice.payments?.length > 0 && (
                    <Card className="border-gray-200 shadow-sm print:hidden">
                        <CardHeader className="pb-3 border-b border-gray-100">
                            <CardTitle className="text-sm font-semibold text-gray-900">Payment History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr>
                                        {['Date', 'Method', 'Reference', 'Amount'].map((h, i) => (
                                            <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 ${i === 0 ? 'pl-6' : ''} ${i === 3 ? 'pr-6 text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.payments.map((p: any) => (
                                        <tr key={p.id} className="border-b border-gray-50 last:border-0">
                                            <td className="py-3 pl-6 pr-4 text-gray-600 text-[13px]">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.method === 'cash' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {p.method === 'cash' ? 'Cash' : 'MoMo'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 text-[12px] font-mono">{p.reference || '—'}</td>
                                            <td className="py-3 px-4 pr-6 text-right font-semibold text-gray-900">GH₵{parseFloat(p.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* Invoice document */}
                <Card id="invoice-printable" className="shadow-sm border-gray-200">
                    <CardContent className="p-8 space-y-8">
                        <div className="flex justify-between border-b border-gray-100 pb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-red-600">{settings?.business_name || 'PerfectService'}</h2>
                                <p className="text-gray-500 text-sm mt-1">Auto Servicing & POS</p>
                                <div className="mt-3 text-sm text-gray-500 space-y-0.5">
                                    {settings?.business_address && <p>{settings.business_address}</p>}
                                    {settings?.business_phone && <p>{settings.business_phone}</p>}
                                    {settings?.business_email && <p>{settings.business_email}</p>}
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xl font-bold text-gray-900">INVOICE</h3>
                                <p className="font-medium text-gray-600 mt-1">{invoice.invoice_number}</p>
                                <div className="mt-3 text-sm space-y-0.5">
                                    <p><span className="text-gray-400">Date:</span> {new Date(invoice.created_at).toLocaleDateString()}</p>
                                    <p><span className="text-gray-400">Job Ref:</span> {invoice.job_card?.job_number}</p>
                                    <p><span className="text-gray-400">Status:</span> <span className="font-semibold capitalize">{invoice.status}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</h4>
                                <p className="font-bold text-gray-900">{invoice.job_card?.customer_name}</p>
                                <p className="text-sm text-gray-500">{invoice.job_card?.customer_phone}</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle</h4>
                                <p className="font-bold text-gray-900">{invoice.job_card?.vehicle_number}</p>
                                <p className="text-sm text-gray-500">{invoice.job_card?.vehicle_make} {invoice.job_card?.vehicle_model}</p>
                            </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-gray-500 font-medium">Description</th>
                                        <th className="px-4 py-3 text-right text-gray-500 font-medium w-32">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {invoice.items?.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{item.description}</p>
                                                {item.notes && <p className="text-gray-400 text-xs italic mt-0.5">{item.notes}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-900">GH₵{parseFloat(item.line_total).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end">
                            <div className="w-64 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium">GH₵{parseFloat(invoice.subtotal).toFixed(2)}</span>
                                </div>
                                {parseFloat(invoice.discount_amount) > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Discount ({parseFloat(invoice.discount_percent)}%)</span>
                                        <span>-GH₵{parseFloat(invoice.discount_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                {parseFloat(invoice.tax_amount) > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tax</span>
                                        <span>GH₵{parseFloat(invoice.tax_amount).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                                    <span>Total</span>
                                    <span>GH₵{parseFloat(invoice.total).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Paid</span>
                                    <span>GH₵{parseFloat(invoice.amount_paid).toFixed(2)}</span>
                                </div>
                                {parseFloat(invoice.balance_due) > 0 && (
                                    <div className="flex justify-between text-red-600 font-bold border-t border-gray-200 pt-2">
                                        <span>Balance Due</span>
                                        <span>GH₵{parseFloat(invoice.balance_due).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400 space-y-1">
                            <p className="font-bold uppercase tracking-wider text-gray-500">Terms & Conditions</p>
                            <p>{settings?.terms_conditions || 'Prices are subject to inspection. Full payment required before vehicle release.'}</p>
                            <p className="mt-3 font-medium">Thank you for your business!</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
