import { Link, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
    '/dashboard':              { title: 'Dashboard' },
    '/dashboard/job-cards':    { title: 'Job Cards',        subtitle: 'Manage workshop jobs' },
    '/dashboard/invoices':     { title: 'Invoices',         subtitle: 'Billing & payments' },
    '/dashboard/services':     { title: 'Services & Pricing', subtitle: 'Service catalogue' },
    '/dashboard/daily-closing':{ title: 'Daily Closing',    subtitle: 'End-of-day reconciliation' },
    '/dashboard/audit-logs':   { title: 'Audit Logs',       subtitle: 'System activity trail' },
    '/dashboard/settings':     { title: 'Settings',         subtitle: 'System configuration' },
    '/dashboard/customers':    { title: 'Customers',        subtitle: 'Customer records' },
    '/dashboard/staff':        { title: 'Staff',            subtitle: 'User management' },
    '/dashboard/pos':          { title: 'POS Terminal',     subtitle: 'Retail point of sale' },
};

function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function TopHeader() {
    const { url } = usePage();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debouncedSearch = useDebounce(searchQuery, 300);

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['global-search', debouncedSearch],
        queryFn: async () => {
            if (debouncedSearch.length < 2) return { results: [] };
            const res = await api.get('/search', { params: { q: debouncedSearch } });
            return res.data;
        },
        enabled: debouncedSearch.length >= 2,
    });

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const results = searchResults?.results || [];

    const getMeta = () => {
        if (pageMeta[url]) return pageMeta[url];
        const parent = url.split('/').slice(0, 3).join('/');
        if (pageMeta[parent]) return pageMeta[parent];
        return { title: 'Dashboard' };
    };

    const meta = getMeta();
    const isDashboard = url === '/dashboard';
    const isJobCards = url.startsWith('/dashboard/job-cards');
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const typeColors: Record<string, string> = {
        job_card: 'bg-blue-50 text-blue-600',
        customer: 'bg-emerald-50 text-emerald-600',
        invoice:  'bg-amber-50 text-amber-600',
    };
    const typeLabels: Record<string, string> = {
        job_card: 'JC',
        customer: 'C',
        invoice:  'INV',
    };

    return (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between h-[64px] px-8">
                {/* Page title */}
                <div className="flex flex-col justify-center">
                    <h1 className="text-[15px] font-bold text-gray-900 leading-tight">{meta.title}</h1>
                    {meta.subtitle && !isDashboard && (
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-none">{meta.subtitle}</p>
                    )}
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-3">
                    {/* New Job Card CTA */}
                    {isJobCards && (
                        <Link
                            href="/dashboard/job-cards/create"
                            className="inline-flex items-center gap-1.5 h-9 px-4 bg-red-600 text-white text-[13px] font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20 active:scale-[0.98]"
                        >
                            <Plus className="h-3.5 w-3.5" /> New Job Card
                        </Link>
                    )}

                    {/* Search */}
                    <div ref={searchRef} className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                            <input
                                aria-label="Search job cards, customers, invoices"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchOpen(true)}
                                className="pl-9 pr-8 w-56 h-9 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-500/10 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {isSearchOpen && searchQuery.length > 0 && (
                            <div className="absolute top-full right-0 mt-1.5 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                {isLoading ? (
                                    <div className="p-4 text-center text-gray-400 text-xs">Searching...</div>
                                ) : results.length > 0 ? (
                                    <div role="listbox" aria-label="Search results" className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
                                        {results.map((result: any) => (
                                            <Link
                                                key={`${result.type}-${result.id}`}
                                                href={result.url}
                                                role="option"
                                                aria-selected="false"
                                                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${typeColors[result.type] ?? 'bg-gray-100 text-gray-500'}`}>
                                                    {typeLabels[result.type] ?? '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-medium text-gray-900 truncate">{result.title}</p>
                                                    <p className="text-[11px] text-gray-400 truncate">{result.subtitle}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div role="status" className="p-4 text-center text-gray-400 text-xs">
                                        No results for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* User avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0">
                        {initials}
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center justify-between h-14 px-4">
                <div>
                    <h1 className="text-[15px] font-bold text-gray-900 leading-tight">{meta.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {isJobCards && (
                        <Link
                            href="/dashboard/job-cards/create"
                            className="inline-flex items-center gap-1 h-8 px-3 bg-red-600 text-white text-[12px] font-semibold rounded-lg"
                        >
                            <Plus className="h-3 w-3" /> New
                        </Link>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-[11px] font-bold text-white">
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
}
