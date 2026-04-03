import DashboardLayout from '@/components/layout/DashboardLayout';


import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, History } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AuditLogsPage() {
    const { user } = useAuth();
    const [search, setSearch] = useState('');

    const { data: logsResponse, isLoading } = useQuery({
        queryKey: ['audit-logs', search],
        queryFn: async () => {
            const res = await api.get('/audit-logs', { params: { search } });
            return res.data;
        },
    });

    const logs = logsResponse?.data || [];

    if (user && user.role !== 'manager') {
        return <div className="p-8 text-center text-red-500">Access Denied. Manager only.</div>;
    }

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Audit Logs</h1>
                <p className="text-sm text-gray-500 mt-1">Track all system activity and changes.</p>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by user, action, or entity..."
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
                        <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />
                    ))
                ) : logs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <History className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No logs found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search.</p>
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <Card key={log.id} className="border-gray-100 shadow-sm">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-gray-900">{log.user?.name || 'System'}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="uppercase text-[10px] tracking-wide">
                                        {log.action}
                                    </Badge>
                                </div>
                                <div className="text-sm text-gray-500 pt-2 border-t border-gray-50">
                                    {log.entity_type} #{log.entity_id}
                                </div>
                                {(log.old_value || log.new_value || log.reason) && (
                                    <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
                                        {log.old_value && (
                                            <p><span className="text-red-500 font-medium">Old:</span> {JSON.stringify(log.old_value)}</p>
                                        )}
                                        {log.new_value && (
                                            <p><span className="text-emerald-600 font-medium">New:</span> {JSON.stringify(log.new_value)}</p>
                                        )}
                                        {log.reason && (
                                            <p className="italic text-gray-500">Reason: {log.reason}</p>
                                        )}
                                    </div>
                                )}
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
                                    <th className="px-6 py-4 whitespace-nowrap">Timestamp</th>
                                    <th className="px-6 py-4 whitespace-nowrap">User</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Action</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Entity</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-4">
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <History className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No audit logs found</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                                    {search ? 'Try adjusting your search terms.' : 'System activity will appear here.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{log.user?.name || 'System'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="uppercase text-[10px] tracking-wide font-bold">
                                                {log.action}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {log.entity_type} #{log.entity_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs space-y-1 max-w-xs">
                                                {log.old_value && (
                                                    <p className="truncate"><span className="text-red-500 font-medium">Old:</span> {JSON.stringify(log.old_value)}</p>
                                                )}
                                                {log.new_value && (
                                                    <p className="truncate"><span className="text-emerald-600 font-medium">New:</span> {JSON.stringify(log.new_value)}</p>
                                                )}
                                                {log.reason && (
                                                    <p className="italic text-gray-500 truncate">Reason: {log.reason}</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </DashboardLayout>
    );
}
