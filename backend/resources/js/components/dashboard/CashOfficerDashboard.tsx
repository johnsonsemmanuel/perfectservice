import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Wallet, Banknote, Smartphone, AlertCircle, FileText, ShoppingCart } from 'lucide-react';

export function CashOfficerDashboard({ stats, user }: { stats: any; user: any }) {
    const cards = [
        {
            title: "Total Revenue Today",
            value: `GH₵${Number(stats?.today?.revenue ?? 0).toFixed(2)}`,
            sub: 'Service + POS combined',
            icon: Wallet, highlight: true,
        },
        {
            title: 'Cash In Hand',
            value: `GH₵${Number(stats?.today?.cash ?? 0).toFixed(2)}`,
            sub: `Service: GH₵${Number(stats?.today?.service_cash ?? 0).toFixed(2)} · POS: GH₵${Number(stats?.today?.pos_cash ?? 0).toFixed(2)}`,
            icon: Banknote, iconBg: 'bg-green-50', iconColor: 'text-green-700',
        },
        {
            title: 'MoMo Received',
            value: `GH₵${Number(stats?.today?.momo ?? 0).toFixed(2)}`,
            sub: 'Mobile money payments',
            icon: Smartphone, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
        },
        {
            title: 'Pending Payments',
            value: stats?.pending_payments ?? 0,
            sub: 'Unpaid invoices',
            icon: AlertCircle, iconBg: 'bg-red-50', iconColor: 'text-red-600',
        },
        {
            title: "Today's Invoices",
            value: stats?.today?.invoices_count ?? 0,
            sub: 'Service invoices issued',
            icon: FileText, iconBg: 'bg-gray-100', iconColor: 'text-gray-600',
        },
        {
            title: 'POS Sales Today',
            value: stats?.today?.pos_sales ?? 0,
            sub: `GH₵${Number(stats?.today?.pos_cash ?? 0).toFixed(2)} retail cash`,
            icon: ShoppingCart, iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Cash Office</h2>
                <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className={`bg-white rounded-2xl p-5 hover:shadow-md transition-shadow ${card.highlight ? 'ring-2 ring-red-600 shadow-md col-span-2 lg:col-span-1' : 'border border-gray-100'}`}>
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.title}</p>
                                <div className={`p-2 rounded-xl ${(card as any).iconBg ?? 'bg-red-50'}`}>
                                    <Icon className={`w-4 h-4 ${(card as any).iconColor ?? 'text-red-600'}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{card.value}</h3>
                            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Cash vs MoMo visual split */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Payment Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    {(() => {
                        const cash = Number(stats?.today?.cash ?? 0);
                        const momo = Number(stats?.today?.momo ?? 0);
                        const total = cash + momo || 1;
                        const cashPct = Math.round((cash / total) * 100);
                        const momoPct = 100 - cashPct;
                        return (
                            <div className="space-y-3">
                                <div className="flex rounded-full overflow-hidden h-4">
                                    <div className="bg-green-500 transition-all" style={{ width: `${cashPct}%` }} />
                                    <div className="bg-blue-500 transition-all" style={{ width: `${momoPct}%` }} />
                                </div>
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500" />
                                        <span className="text-gray-600">Cash ({cashPct}%)</span>
                                        <span className="font-bold text-gray-900">GH₵{cash.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-gray-600">MoMo ({momoPct}%)</span>
                                        <span className="font-bold text-gray-900">GH₵{momo.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                    <Link href="/dashboard/invoices" className="text-xs font-medium text-red-600 hover:text-red-800">View All →</Link>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="text-left py-2.5 px-4 rounded-l-xl text-xs font-medium">Invoice</th>
                                    <th className="text-left py-2.5 px-4 text-xs font-medium">Customer</th>
                                    <th className="text-left py-2.5 px-4 text-xs font-medium">Amount</th>
                                    <th className="text-left py-2.5 px-4 text-xs font-medium">Time</th>
                                    <th className="text-left py-2.5 px-4 rounded-r-xl text-xs font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recent_invoices?.map((inv: any) => (
                                    <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">
                                            <Link href={`/dashboard/invoices/${inv.id}`} className="hover:text-red-600">{inv.invoice_number}</Link>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{inv.job_card?.customer_name ?? '—'}</td>
                                        <td className="py-3 px-4 font-semibold">GH₵{Number(inv.total).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-gray-500 text-xs">
                                            {inv.created_at ? new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                        </td>
                                        <td className="py-3 px-4"><StatusBadge status={inv.status} type="invoice" /></td>
                                    </tr>
                                ))}
                                {!stats?.recent_invoices?.length && (
                                    <tr><td colSpan={5} className="py-8 text-center text-gray-400">No transactions today.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
