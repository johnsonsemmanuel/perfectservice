import { Link } from '@inertiajs/react';
import { StatusBadge } from '@/components/ui/status-badge';
import {
    Wallet, ClipboardList, TrendingUp, TrendingDown, Car,
    AlertTriangle, ShoppingCart, Package, Users, ArrowUpRight,
    ArrowRight, BarChart3,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const DONUT_COLORS = ['#dc2626', '#f97316', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

// ── Shared primitives ──────────────────────────────────────────────────────────

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

function ViewAllLink({ href }: { href: string }) {
    return (
        <Link href={href} className="flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700 transition-colors">
            View all <ArrowUpRight className="w-3 h-3" />
        </Link>
    );
}

function StatCard({
    title, value, sub, icon: Icon, accent = false,
    iconBg = 'bg-gray-100', iconColor = 'text-gray-500',
    change,
}: {
    title: string; value: string | number; sub?: string;
    icon: React.ElementType; accent?: boolean;
    iconBg?: string; iconColor?: string;
    change?: number;
}) {
    const isPositive = (change ?? 0) >= 0;
    return (
        <div className={`relative bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
            accent ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200/60 shadow-sm'
        }`}>
            {accent && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl" />}
            <div className="flex items-start justify-between mb-4">
                <p className="text-[12px] font-medium text-gray-500 leading-tight">{title}</p>
                <div className={`p-2 rounded-xl ${iconBg}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-1.5 leading-snug">{sub}</p>}
            {change !== undefined && change !== 0 && (
                <div className="flex items-center gap-1 mt-2.5">
                    {isPositive
                        ? <TrendingUp className="w-3 h-3 text-emerald-500" />
                        : <TrendingDown className="w-3 h-3 text-red-400" />}
                    <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {Math.abs(change)}%
                    </span>
                    <span className="text-[11px] text-gray-400">vs last month</span>
                </div>
            )}
        </div>
    );
}

function DataTable({ headers, children, emptyText = 'No data' }: {
    headers: string[];
    children: React.ReactNode;
    emptyText?: string;
}) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
                <thead>
                    <tr>
                        {headers.map((h, i) => (
                            <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50 ${
                                i === 0 ? 'pl-6' : ''
                            } ${i === headers.length - 1 ? 'pr-6' : ''}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function TableRow({ children }: { children: React.ReactNode }) {
    return (
        <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
            {children}
        </tr>
    );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <td className={`py-3 px-4 text-gray-700 ${className}`}>{children}</td>;
}

// ── Custom chart tooltip ───────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-[11px]">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.fill }} className="font-medium">
                    {p.name === 'service' ? 'Service' : 'POS'}: GH₵{Number(p.value).toFixed(2)}
                </p>
            ))}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ManagerDashboard({ stats, user, chartRange, onRangeChange }: {
    stats: any; user: any;
    chartRange?: 7 | 30;
    onRangeChange?: (r: 7 | 30) => void;
}) {
    const range = chartRange ?? 7;
    const serviceBreakdown = stats?.service_breakdown ?? [];
    const totalServices = serviceBreakdown.reduce((a: number, i: any) => a + Number(i.value), 0);

    return (
        <div className="space-y-6 animate-fade-up">

            {/* ── Page header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Good {getGreeting()}, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-0.5">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link
                    href="/dashboard/job-cards/create"
                    className="inline-flex items-center gap-2 h-9 px-4 bg-red-600 text-white text-[13px] font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20 active:scale-[0.98] w-fit"
                >
                    <ClipboardList className="w-3.5 h-3.5" /> New Job Card
                </Link>
            </div>

            {/* ── Alerts ──────────────────────────────────────────── */}
            {stats?.critical_alerts?.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-[13px] font-semibold text-red-900">Requires Attention</span>
                        <Link href="/dashboard/audit-logs" className="ml-auto text-[11px] font-medium text-red-600 hover:underline">
                            View all →
                        </Link>
                    </div>
                    {stats.critical_alerts.map((alert: any) => (
                        <div key={alert.id} className="flex items-center gap-3 bg-white/70 px-3 py-2.5 rounded-xl border border-red-100/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                            <span className="text-[12px] font-medium text-gray-800 flex-1">{alert.action}</span>
                            <span className="text-[11px] text-gray-400">
                                {alert.user?.name} · {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {stats?.low_stock?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-4 h-4 text-amber-600" />
                        <span className="text-[13px] font-semibold text-amber-900">Low Stock</span>
                        <Link href="/dashboard/pos" className="ml-auto text-[11px] font-medium text-amber-700 hover:underline">
                            Manage →
                        </Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {stats.low_stock.map((p: any) => (
                            <span key={p.id} className="inline-flex items-center gap-1.5 bg-white border border-amber-100 text-[12px] px-3 py-1.5 rounded-lg">
                                <span className="font-medium text-gray-800">{p.name}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── KPI row ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Today's Revenue"
                    value={`GH₵${Number(stats?.today?.revenue ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
                    sub={`Service GH₵${Number(stats?.today?.service_revenue ?? 0).toFixed(2)} · POS GH₵${Number(stats?.today?.pos_revenue ?? 0).toFixed(2)}`}
                    icon={Wallet} accent
                    iconBg="bg-red-50" iconColor="text-red-600"
                    change={stats?.today?.revenue_change}
                />
                <StatCard
                    title="Outstanding Balance"
                    value={`GH₵${Number(stats?.outstanding?.balance ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`}
                    sub={`${stats?.outstanding?.open_job_cards ?? 0} open job cards`}
                    icon={AlertTriangle}
                    iconBg="bg-amber-50" iconColor="text-amber-600"
                />
                <StatCard
                    title="Jobs Today"
                    value={stats?.today?.job_cards ?? 0}
                    sub={`${stats?.today?.invoices ?? 0} invoices issued`}
                    icon={Car}
                    iconBg="bg-blue-50" iconColor="text-blue-600"
                />
                <StatCard
                    title="POS Sales Today"
                    value={stats?.today?.pos_sales ?? 0}
                    sub={`GH₵${Number(stats?.today?.pos_revenue ?? 0).toFixed(2)} retail`}
                    icon={ShoppingCart}
                    iconBg="bg-violet-50" iconColor="text-violet-600"
                />
            </div>

            {/* ── Month summary strip ──────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Month Revenue', value: `GH₵${Number(stats?.month?.revenue ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}` },
                    { label: 'Service Revenue', value: `GH₵${Number(stats?.month?.service_revenue ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}` },
                    { label: 'POS Revenue', value: `GH₵${Number(stats?.month?.pos_revenue ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}` },
                    { label: 'Month Job Cards', value: stats?.month?.job_cards ?? 0 },
                ].map(item => (
                    <div key={item.label} className="bg-white rounded-xl px-4 py-3 border border-gray-200/60 shadow-sm">
                        <p className="text-[11px] text-gray-400 font-medium">{item.label}</p>
                        <p className="text-[15px] font-bold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* ── Charts row ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Revenue bar chart */}
                <Section className="lg:col-span-2">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <div>
                            <h3 className="text-[13px] font-semibold text-gray-900">Revenue Overview</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Service + POS combined</p>
                        </div>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {([7, 30] as const).map(d => (
                                <button key={d} onClick={() => onRangeChange?.(d)}
                                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                        range === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.revenue_chart ?? []} barSize={14} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} tick={{ fill: '#9ca3af' }} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="service" stackId="a" fill="#dc2626" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="pos" stackId="a" fill="#fca5a5" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 px-6 pb-4">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" /> Service
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                            <span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" /> POS Retail
                        </div>
                    </div>
                </Section>

                {/* Service mix donut */}
                <Section>
                    <SectionHeader title="Service Mix" />
                    <div className="p-5">
                        {serviceBreakdown.length === 0 ? (
                            <div className="h-44 flex flex-col items-center justify-center text-gray-300 gap-2">
                                <BarChart3 className="w-8 h-8" />
                                <p className="text-[12px]">No data this month</p>
                            </div>
                        ) : (
                            <>
                                <div className="relative h-[150px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={serviceBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                                                {serviceBreakdown.map((_: any, i: number) => (
                                                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <p className="text-[10px] text-gray-400">Total</p>
                                        <p className="text-[17px] font-bold text-gray-900">GH₵{Number(totalServices).toFixed(0)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-3">
                                    {serviceBreakdown.slice(0, 5).map((item: any, i: number) => (
                                        <div key={item.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                                                <span className="text-[12px] text-gray-600 capitalize truncate max-w-[110px]">{item.name}</span>
                                            </div>
                                            <span className="text-[12px] font-semibold text-gray-900">GH₵{Number(item.value).toFixed(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </Section>
            </div>

            {/* ── Bottom row ──────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Staff leaderboard */}
                <Section>
                    <SectionHeader title="Staff Performance" />
                    <div className="p-5 space-y-4">
                        {stats?.tech_performance?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Technicians</p>
                                <div className="space-y-2">
                                    {stats.tech_performance.map((t: any, i: number) => (
                                        <div key={t.technician} className="flex items-center gap-3">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                                            }`}>{i + 1}</span>
                                            <span className="flex-1 text-[13px] text-gray-700 truncate">{t.technician}</span>
                                            <span className="text-[13px] font-bold text-gray-900">{t.jobs_completed}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {stats?.advisor_performance?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Advisors</p>
                                <div className="space-y-2">
                                    {stats.advisor_performance.map((a: any, i: number) => (
                                        <div key={a.name} className="flex items-center gap-3">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                            }`}>{i + 1}</span>
                                            <span className="flex-1 text-[13px] text-gray-700 truncate">{a.name}</span>
                                            <span className="text-[13px] font-bold text-gray-900">{a.jobs_created}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!stats?.tech_performance?.length && !stats?.advisor_performance?.length && (
                            <p className="text-[12px] text-gray-400 text-center py-6">No data this month</p>
                        )}
                    </div>
                </Section>

                {/* Recent invoices */}
                <Section className="lg:col-span-2">
                    <SectionHeader title="Recent Invoices" action={<ViewAllLink href="/dashboard/invoices" />} />
                    <DataTable headers={['Invoice', 'Customer', 'Amount', 'Status']}>
                        {stats?.recent_invoices?.map((inv: any) => (
                            <TableRow key={inv.id}>
                                <Td className="pl-6 font-medium">
                                    <Link href={`/dashboard/invoices/${inv.id}`} className="text-gray-900 hover:text-red-600 transition-colors">
                                        {inv.invoice_number}
                                    </Link>
                                </Td>
                                <Td className="text-gray-500">{inv.job_card?.customer_name ?? '—'}</Td>
                                <Td className="font-semibold text-gray-900">GH₵{Number(inv.total).toLocaleString()}</Td>
                                <Td className="pr-6"><StatusBadge status={inv.status} type="invoice" /></Td>
                            </TableRow>
                        ))}
                        {!stats?.recent_invoices?.length && (
                            <tr><td colSpan={4} className="py-10 text-center text-[13px] text-gray-400">No recent invoices</td></tr>
                        )}
                    </DataTable>
                </Section>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}
