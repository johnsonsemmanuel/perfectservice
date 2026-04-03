import { Link } from '@inertiajs/react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Wallet, Banknote, Smartphone, AlertCircle, FileText, ShoppingCart, ArrowUpRight } from 'lucide-react';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white rounded-2xl border border-gray-200/60 shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}

export function CashOfficerDashboard({ stats, user }: { stats: any; user: any }) {
    const cards = [
        {
            title: 'Total Revenue Today',
            value: `GH₵${Number(stats?.today?.revenue ?? 0).toFixed(2)}`,
            sub: 'Service + POS combined',
            icon: Wallet, accent: true,
            iconBg: 'bg-red-50', iconColor: 'text-red-600',
        },
        {
            title: 'Cash In Hand',
            value: `GH₵${Number(stats?.today?.cash ?? 0).toFixed(2)}`,
            sub: `Service GH₵${Number(stats?.today?.service_cash ?? 0).toFixed(2)} · POS GH₵${Number(stats?.today?.pos_cash ?? 0).toFixed(2)}`,
            icon: Banknote,
            iconBg: 'bg-emerald-50', iconColor: 'text-emerald-700',
        },
        {
            title: 'MoMo Received',
            value: `GH₵${Number(stats?.today?.momo ?? 0).toFixed(2)}`,
            sub: 'Mobile money payments',
            icon: Smartphone,
            iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
        },
        {
            title: 'Pending Payments',
            value: stats?.pending_payments ?? 0,
            sub: 'Unpaid invoices',
            icon: AlertCircle,
            iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
        },
        {
            title: "Today's Invoices",
            value: stats?.today?.invoices_count ?? 0,
            sub: 'Service invoices issued',
            icon: FileText,
            iconBg: 'bg-gray-100', iconColor: 'text-gray-600',
        },
        {
            title: 'POS Sales Today',
            value: stats?.today?.pos_sales ?? 0,
            sub: `GH₵${Number(stats?.today?.pos_cash ?? 0).toFixed(2)} retail cash`,
            icon: ShoppingCart,
            iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
        },
    ];

    const cash = Number(stats?.today?.cash ?? 0);
    const momo = Number(stats?.today?.momo ?? 0);
    const total = cash + momo || 1;
    const cashPct = Math.round((cash / total) * 100);
    const momoPct = 100 - cashPct;

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Good {getGreeting()}, {user?.name?.split(' ')[0]}</h1>
                <p className="text-[13px] text-gray-400 mt-0.5">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.title} className={`relative bg-white rounded-2xl p-5 border transition-shadow hover:shadow-md ${
                            (card as any).accent ? 'border-red-200 ring-1 ring-red-100 col-span-2 lg:col-span-1' : 'border-gray-100'
                        }`}>
                            {(card as any).accent && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl" />
                            )}
                            <div className="flex items-start justify-between mb-3">
                                <p className="text-[12px] font-medium text-gray-500 leading-tight">{card.title}</p>
                                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-[11px] text-gray-400 mt-1 leading-snug">{card.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* Payment method breakdown */}
            <Section>
                <SectionHeader title="Payment Method Breakdown" />
                <div className="p-6 space-y-4">
                    <div className="flex rounded-full overflow-hidden h-3 bg-gray-100">
                        <div className="bg-emerald-500 transition-all duration-500 rounded-l-full" style={{ width: `${cashPct}%` }} />
                        <div className="bg-blue-500 transition-all duration-500 rounded-r-full" style={{ width: `${momoPct}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            <div>
                                <p className="text-[11px] text-emerald-700 font-medium">Cash ({cashPct}%)</p>
                                <p className="text-[15px] font-bold text-emerald-900">GH₵{cash.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <p className="text-[11px] text-blue-700 font-medium">MoMo ({momoPct}%)</p>
                                <p className="text-[15px] font-bold text-blue-900">GH₵{momo.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Recent transactions */}
            <Section>
                <SectionHeader title="Recent Transactions" action={
                    <Link href="/dashboard/invoices" className="flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700">
                        View all <ArrowUpRight className="w-3 h-3" />
                    </Link>
                } />
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr>
                                {['Invoice', 'Customer', 'Amount', 'Time', 'Status'].map((h, i) => (
                                    <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50 ${i === 0 ? 'pl-6' : ''} ${i === 4 ? 'pr-6' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.recent_invoices?.map((inv: any) => (
                                <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                    <td className="py-3 pl-6 pr-4 font-medium">
                                        <Link href={`/dashboard/invoices/${inv.id}`} className="text-gray-900 hover:text-red-600 transition-colors">
                                            {inv.invoice_number}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">{inv.job_card?.customer_name ?? '—'}</td>
                                    <td className="py-3 px-4 font-semibold text-gray-900">GH₵{Number(inv.total).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-[12px] text-gray-400">
                                        {inv.created_at ? new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </td>
                                    <td className="py-3 px-4 pr-6"><StatusBadge status={inv.status} type="invoice" /></td>
                                </tr>
                            ))}
                            {!stats?.recent_invoices?.length && (
                                <tr><td colSpan={5} className="py-10 text-center text-[13px] text-gray-400">No transactions today</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
}
