import DashboardLayout from '@/components/layout/DashboardLayout';


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, CheckCircle, Lock, DollarSign, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

import { DetailSkeleton } from '@/components/dashboard/DetailSkeleton';

export default function DailyClosingPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
    const [actualCash, setActualCash] = useState('');
    const [actualMoMo, setActualMoMo] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const { data: historyData } = useQuery({
        queryKey: ['daily-closings-history'],
        queryFn: async () => {
            const res = await api.get('/daily-closings?per_page=30');
            return res.data;
        },
        enabled: activeTab === 'history',
    });

    const { data: closing, isLoading, isError } = useQuery({
        queryKey: ['daily-closing', 'today'],
        queryFn: async () => {
            const res = await api.get('/daily-closings?date=today');
            return res.data?.data?.[0] || null;
        },
    });

    const generateClosing = useMutation({
        mutationFn: async () => {
            const res = await api.post('/daily-closings');
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-closing'] });
        },
    });

    const finalizeClosing = useMutation({
        mutationFn: async (data: any) => {
            if (!closing?.id) return;
            const res = await api.post(`/daily-closings/${closing.id}/finalize`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-closing'] });
            toast('success', 'Day Closed', 'The daily records have been reconciled and locked.');
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to close day.';
            setError(msg);
            toast('error', 'Reconciliation Failed', msg);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        finalizeClosing.mutate({
            actual_cash: parseFloat(actualCash || '0'),
            actual_momo: parseFloat(actualMoMo || '0'),
            note,
        });
    };

    if (isLoading) return <DashboardLayout><DetailSkeleton /></DashboardLayout>;

    if (isError) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-900 font-semibold">Failed to load daily closing data</p>
                <p className="text-sm text-gray-400 mt-1">Check your connection and try refreshing.</p>
            </div>
        </DashboardLayout>
    );

    if (!closing) {
        return (
        <DashboardLayout>
            <div className="mt-8">
                <Card className="border-gray-100 shadow-sm overflow-hidden">
                    <CardContent className="p-12 flex flex-col items-center text-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center border border-red-100">
                            <Lock className="w-10 h-10 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Today&apos;s Report Pending</h2>
                            <p className="text-gray-500 max-w-sm text-sm">No closing report has been generated for today. Start the reconciliation process to finalize the day&apos;s transactions.</p>
                        </div>
                        <div className="pt-4">
                            <Button
                                onClick={() => generateClosing.mutate()}
                                disabled={generateClosing.isPending}
                                size="lg"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-red-900/10"
                            >
                                {generateClosing.isPending ? (
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                ) : (
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                )}
                                Generate Daily Report
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
        );
    }

    const expectedTotal = parseFloat(closing.cash_total || '0') + parseFloat(closing.momo_total || '0');
    const actualTotal = (parseFloat(actualCash || '0') + parseFloat(actualMoMo || '0'));
    const discrepancy = actualTotal - expectedTotal;

    return (
        <DashboardLayout>
        <div className="w-full space-y-6">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-2">
                {([['today', 'Today'], ['history', 'History']] as const).map(([t, label]) => (
                    <button key={t} onClick={() => setActiveTab(t)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t === 'history' && <History className="w-3.5 h-3.5" />}
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-[13px] font-semibold text-gray-900">Closing History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr>
                                    {['Date', 'Expected', 'Actual', 'Discrepancy', 'Status'].map((h, i) => (
                                        <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 ${i === 0 ? 'pl-6' : ''} ${i === 4 ? 'pr-6' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {historyData?.data?.map((c: any) => (
                                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 pl-6 pr-4 font-medium text-gray-900">{new Date(c.closing_date).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-gray-600">GH₵{parseFloat(c.expected_total || '0').toFixed(2)}</td>
                                        <td className="py-3 px-4 text-gray-600">GH₵{(parseFloat(c.actual_cash || '0') + parseFloat(c.actual_momo || '0')).toFixed(2)}</td>
                                        <td className="py-3 px-4">
                                            {c.discrepancy != null && parseFloat(c.discrepancy) !== 0 ? (
                                                <span className={`text-[12px] font-semibold ${parseFloat(c.discrepancy) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {parseFloat(c.discrepancy) > 0 ? '+' : ''}GH₵{parseFloat(c.discrepancy).toFixed(2)}
                                                </span>
                                            ) : <span className="text-gray-300 text-[12px]">—</span>}
                                        </td>
                                        <td className="py-3 px-4 pr-6">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${c.status === 'closed' ? 'bg-emerald-50 text-emerald-700' : c.status === 'flagged' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!historyData?.data?.length && (
                                    <tr><td colSpan={5} className="py-10 text-center text-[13px] text-gray-400">No closing history yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'today' && <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Reconciliation</h1>
                    <p className="text-gray-500 text-sm mt-1">Review system totals and confirm physical balances</p>
                </div>
                <Badge
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${closing.status === 'closed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        closing.status === 'flagged' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                >
                    Status: {closing.status}
                </Badge>
            </div>

            {closing.status !== 'open' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-gray-100 shadow-sm">
                        <CardHeader className="border-b border-gray-100 pb-4">
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                Report Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expected Total</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">GH₵{parseFloat(closing.expected_total).toFixed(2)}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actual Recorded</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">GH₵{(parseFloat(closing.actual_cash || '0') + parseFloat(closing.actual_momo || '0')).toFixed(2)}</p>
                                </div>
                            </div>

                            {parseFloat(closing.discrepancy) !== 0 && (
                                <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-4">
                                    <div className="p-2 bg-red-600 rounded-lg shrink-0">
                                        <AlertTriangle className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-red-900">Variance Detected</p>
                                        <p className="text-sm text-red-700/70 leading-relaxed">The system recorded a variance of <span className="text-red-700 font-bold">GH₵{Math.abs(parseFloat(closing.discrepancy)).toFixed(2)}</span>. This has been flagged for administrative review.</p>
                                    </div>
                                </div>
                            )}

                            <Button variant="outline" className="w-full h-11 border-gray-200 text-gray-400" disabled>
                                <Lock className="w-4 h-4 mr-2" />
                                Re-opening is Restricted
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-100 shadow-sm">
                        <CardHeader className="border-b border-gray-100">
                            <CardTitle className="text-sm uppercase tracking-widest text-gray-400">Record Note</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="text-sm text-gray-600 italic leading-relaxed">
                                &ldquo;{closing.note || 'No additional remarks provided for this session.'}&rdquo;
                            </div>
                            <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 uppercase font-medium">
                                Closed at {new Date(closing.updated_at).toLocaleTimeString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-gray-900 text-base">System Expected Totals</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Expected Cash</p>
                                        <p className="text-xl font-mono font-bold text-gray-900 mt-1">GH₵{parseFloat(closing.cash_total || '0').toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Expected MoMo</p>
                                        <p className="text-xl font-mono font-bold text-gray-900 mt-1">GH₵{parseFloat(closing.momo_total || '0').toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                        <p className="text-[10px] text-red-600 uppercase font-bold">Total Revenue</p>
                                        <p className="text-xl font-bold text-red-700 mt-1">GH₵{expectedTotal.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-gray-100 shadow-sm overflow-hidden">
                            <CardHeader className="bg-red-50/50 border-b border-red-100">
                                <CardTitle className="text-red-900 text-base">Physical Inventory Count</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 text-xs font-bold uppercase tracking-wider">Physical Cash Count</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">GH₵</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="h-12 pl-14 bg-gray-50 border-gray-200 rounded-xl font-mono text-lg focus:bg-white transition-all"
                                                value={actualCash}
                                                onChange={e => setActualCash(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-500 text-xs font-bold uppercase tracking-wider">MoMo Account Balance</Label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">GH₵</span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="h-12 pl-14 bg-gray-50 border-gray-200 rounded-xl font-mono text-lg focus:bg-white transition-all"
                                                value={actualMoMo}
                                                onChange={e => setActualMoMo(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-500 text-xs font-bold uppercase tracking-wider">Official Reconciliation Notes</Label>
                                    <textarea
                                        className="w-full p-4 min-h-[100px] bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-600/10"
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        placeholder="Explain any discrepancies or variance detected..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <DollarSign className="w-20 h-20 text-gray-900" />
                            </div>
                            <CardHeader className="border-b border-gray-100">
                                <CardTitle className="text-sm font-bold text-gray-400 uppercase tracking-widest">Reconciliation Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-gray-500 text-sm">Actual Total</p>
                                    <p className="text-3xl font-bold text-gray-900">GH₵{actualTotal.toFixed(2)}</p>
                                </div>

                                {discrepancy !== 0 && (actualCash || actualMoMo) && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 ${discrepancy > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        <AlertTriangle className="w-5 h-5" />
                                        <div className="text-xs font-bold uppercase">
                                            Variance: GH₵{discrepancy.toFixed(2)}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/10 transition-all active:scale-95 disabled:opacity-50"
                                        disabled={finalizeClosing.isPending}
                                    >
                                        {finalizeClosing.isPending ? (
                                            <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                        ) : (
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                        )}
                                        Finalize & Close Day
                                    </Button>
                                    <p className="text-center text-[10px] text-gray-400 uppercase mt-4">
                                        This action will lock all records for today.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            )}
        </div>
            </div>}
        </DashboardLayout>
    );
}
