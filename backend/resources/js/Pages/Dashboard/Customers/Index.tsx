import DashboardLayout from '@/components/layout/DashboardLayout';


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, User, MapPin, Phone, Mail, Users, Eye } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function CustomersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // New Customer Form
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    const { data: customersData, isLoading, isError } = useQuery({
        queryKey: ['customers', search],
        queryFn: async () => {
            const res = await api.get('/customers', { params: { search } });
            return res.data;
        },
    });

    const customers = customersData?.data || [];

    if (isError) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-gray-900 font-semibold">Failed to load customers</p>
                <p className="text-sm text-gray-400 mt-1">Check your connection and try refreshing the page.</p>
            </div>
        </DashboardLayout>
    );

    const createCustomer = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/customers', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsCreating(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '', notes: '' });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createCustomer.mutate(newCustomer);
    };

    return (
        <DashboardLayout>
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage client profiles and contact information.</p>
                </div>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    className="w-full sm:w-auto bg-black hover:bg-gray-900 shadow-lg shadow-gray-900/10"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Customer
                </Button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <Card className="border-red-100 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader className="bg-red-50/50 border-b border-red-50 pb-4">
                        <CardTitle className="text-base font-semibold text-red-900 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Add New Customer Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Full Name</Label>
                                    <Input
                                        value={newCustomer.name}
                                        onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        required
                                        placeholder="e.g. John Mensah"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Phone Number</Label>
                                    <Input
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                        placeholder="e.g. 024 123 4567"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Email Address (Optional)</Label>
                                    <Input
                                        type="email"
                                        value={newCustomer.email}
                                        onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Address (Optional)</Label>
                                    <Input
                                        value={newCustomer.address}
                                        onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                        placeholder="House No, Street Name"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createCustomer.isPending} className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10">
                                    {createCustomer.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Customer Profile'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filter/Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, phone, or email..."
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
                ) : customers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
                        <p className="text-sm text-gray-500 mt-1">Try changing your search.</p>
                    </div>
                ) : (
                    customers.map((customer: any) => (
                        <Card key={customer.id} className="border-gray-100 shadow-sm overflow-hidden">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-sm font-bold text-red-700">
                                        {customer.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{customer.name}</div>
                                        <div className="text-xs text-gray-400">ID: #{customer.id.toString().padStart(4, '0')}</div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-gray-50 text-sm">
                                    {customer.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-gray-700">{customer.phone}</span>
                                        </div>
                                    )}
                                    {customer.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-gray-700">{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-gray-700">{customer.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Link href={`/dashboard/customers/${customer.id}`}>
                                        <Button variant="outline" className="w-full text-red-700 border-red-100 bg-red-50/50 hover:bg-red-50">
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Profile
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
                                    <th className="px-6 py-4 whitespace-nowrap">Name</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Location</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="p-4">
                                            <div className="space-y-4">
                                                {[1, 2, 3, 4, 5].map((i) => (
                                                    <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <Users className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                                    {search ? 'Try adjusting your search terms.' : 'Add your first customer to get started.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer: any) => (
                                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-xs font-bold text-red-700">
                                                        {customer.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{customer.name}</div>
                                                        <div className="text-xs text-gray-400 hidden sm:block">ID: #{customer.id.toString().padStart(4, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex flex-col gap-1.5">
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {customer.address ? (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        {customer.address}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/customers/${customer.id}`}>
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
        </DashboardLayout>
    );
}
