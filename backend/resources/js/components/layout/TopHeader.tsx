import { Link, usePage } from '@inertiajs/react';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/job-cards': 'Job Cards',
    '/dashboard/invoices': 'Invoices',
    '/dashboard/services': 'Services & Pricing',
    '/dashboard/daily-closing': 'Daily Closing',
    '/dashboard/audit-logs': 'Audit Logs',
    '/dashboard/settings': 'Settings',
    '/dashboard/customers': 'Customers',
    '/dashboard/staff': 'Staff',
    '/dashboard/pos': 'POS Terminal',
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

    const results = searchResults?.results || [];
    const getPageTitle = () => {
        if (pageTitles[url]) return pageTitles[url];
        const segments = url.split('/');
        if (segments.length >= 4) {
            const parent = segments.slice(0, 3).join('/');
            if (pageTitles[parent]) return pageTitles[parent];
        }
        return 'Dashboard';
    };

    const isDashboard = url === '/dashboard';
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="sticky top-0 z-30 bg-black shadow-sm">
            <div className="hidden md:flex items-center justify-between h-20 px-8">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-white tracking-tight">{getPageTitle()}</h1>
                    {!isDashboard && <p className="text-white/40 text-xs mt-0.5">PerfectService POS</p>}
                </div>
                <div className="flex items-center gap-4">
                    {!isDashboard && url.includes('/job-cards') && (
                        <Link href="/dashboard/job-cards/create" className="flex items-center gap-2 h-10 px-4 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all active:scale-95">
                            <Plus className="h-4 w-4" /> New Job Card
                        </Link>
                    )}
                    <div className="relative z-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <input
                            aria-label="Search job cards, customers, invoices"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchOpen(true)}
                            className="pl-10 w-64 h-10 bg-white/10 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15 transition-all"
                        />
                        {isSearchOpen && searchQuery.length > 0 && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsSearchOpen(false)} />
                                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    {isLoading ? (
                                        <div className="p-4 text-center text-gray-500 text-xs">Searching...</div>
                                    ) : results.length > 0 ? (
                                        <div role="listbox" aria-label="Search results" className="max-h-[300px] overflow-y-auto">
                                            {results.map((result: any) => (
                                                <Link key={`${result.type}-${result.id}`} href={result.url}
                                                    role="option"
                                                    aria-selected="false"
                                                    onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${result.type === 'job_card' ? 'bg-blue-50 text-blue-600' : result.type === 'customer' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {result.type === 'job_card' ? 'JC' : result.type === 'customer' ? 'C' : 'INV'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{result.title}</div>
                                                        <div className="text-xs text-gray-500">{result.subtitle}</div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div role="status" className="p-4 text-center text-gray-500 text-xs">No results found</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex md:hidden items-center justify-between h-16 px-6">
                <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
                <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center text-xs font-bold text-white">{initials}</div>
            </div>
        </header>
    );
}
