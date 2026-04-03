

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Wallet, Banknote, AlertCircle, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function CashOfficerDashboard({ stats, user }: { stats: any, user: any }) {
    const statCards = [
        {
            title: "Today's Total",
            value: `GH₵${stats.today?.revenue?.toLocaleString() ?? '0.00'}`,
            icon: Wallet,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            highlight: true,
        },
        {
            title: 'Cash In Hand',
            value: `GH₵${stats.today?.cash?.toLocaleString() ?? '0.00'}`,
            icon: Banknote,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-900',
        },
        {
            title: 'Pending Payments',
            value: stats.pending_payments ?? 0,
            icon: AlertCircle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
        },
        {
            title: "Today's Invoices",
            value: stats.today?.invoices_count ?? 0,
            icon: FileText,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
        },
    ];

    return (
        <div className="space-y-6 -mt-4">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Cash Office</h2>
                <p className="text-sm text-gray-500">Welcome back, {user?.name?.split(' ')[0]}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className={`bg-white rounded-2xl p-5 transition-shadow hover:shadow-md ${stat.highlight
                                ? 'ring-2 ring-red-600 shadow-md'
                                : 'border border-gray-100'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    );
                })}
            </div>

            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                    <Link href="/dashboard/invoices" className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors">
                        View All →
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-left py-3 px-4 rounded-l-xl font-medium text-xs">Invoice</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs">Customer</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs">Amount</th>
                                    <th className="text-left py-3 px-4 font-medium text-xs">Time</th>
                                    <th className="text-left py-3 px-4 rounded-r-xl font-medium text-xs">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_invoices?.map((invoice: any) => (
                                    <tr key={invoice.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.invoice_number}</td>
                                        <td className="py-3 px-4 text-gray-600">{invoice.job_card?.customer_name || '—'}</td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">GH₵{Number(invoice.total).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                            {invoice.created_at ? new Date(invoice.created_at).toLocaleTimeString() : '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={invoice.status} type="invoice" />
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recent_invoices?.length) && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-400">No transactions today.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
