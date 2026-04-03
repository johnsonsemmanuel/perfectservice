'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Plus, FileText, Receipt, Calendar, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function InvoicesPage() {
    const [search, setSearch] = useState('');

    const { data: invoicesResponse, isLoading } = useQuery({
        queryKey: ['invoices', search],
        queryFn: async () => {
            const res = await api.get('/invoices', { params: { search } });
            return res.data;
        },
    });

    const invoices = invoicesResponse?.data || [];

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'issued': return 'warning';
            case 'void': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Invoices</h1>
                    <p className="text-sm text-gray-500 mt-1">Track payments, balances, and financial records.</p>
                </div>
                <Link href="/dashboard/job-cards">
                    <Button variant="outline" className="w-full sm:w-auto border-gray-200 text-gray-700 bg-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Invoice (via Job Card)
                    </Button>
                </Link>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by invoice # or customer..."
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
                        <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : invoices.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try changing your search.</p>
                    </div>
                ) : (
                    invoices.map((inv: any) => (
                        <Card key={inv.id} className="border-gray-100 shadow-sm overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Invoice #{inv.invoice_number}</div>
                                        <div className="font-semibold text-lg text-red-900">GH₵{parseFloat(inv.total).toFixed(2)}</div>
                                    </div>
                                    <Badge variant={getStatusBadgeVariant(inv.status)} className="capitalize shadow-none">
                                        {inv.status}
                                    </Badge>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-50">
                                    <div className="text-sm">
                                        <div className="text-xs text-gray-400">Customer</div>
                                        <div className="font-medium text-gray-900">{inv.job_card?.customer_name}</div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <div className="text-xs text-gray-400">Paid</div>
                                            <div className="text-emerald-600 font-medium">GH₵{parseFloat(inv.amount_paid).toFixed(2)}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 text-right">Balance</div>
                                            <div className="text-red-600 font-medium text-right">GH₵{parseFloat(inv.balance_due).toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link href={`/dashboard/invoices/${inv.id}`}>
                                        <Button variant="outline" className="w-full text-red-700 border-red-100 bg-red-50/50 hover:bg-red-50">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Invoice
                                        </Button>
                                    </Link>
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
                                    <th className="px-6 py-4 whitespace-nowrap">Invoice #</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Job Card</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Total</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Paid</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Balance</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={9} className="p-4">
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <Receipt className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                                    {search ? 'Try adjusting your search terms.' : 'Invoices will appear here once generated from job cards.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-red-900">{inv.invoice_number}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{inv.job_card?.customer_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{inv.job_card?.job_number}</td>
                                            <td className="px-6 py-4 font-medium">GH₵{parseFloat(inv.total).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">GH₵{parseFloat(inv.amount_paid).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                {parseFloat(inv.balance_due) > 0 ? (
                                                    <span className="text-red-600 font-medium">GH₵{parseFloat(inv.balance_due).toFixed(2)}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusBadgeVariant(inv.status)} className="capitalize shadow-none">
                                                    {inv.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(inv.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/invoices/${inv.id}`}>
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
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
    );
}
