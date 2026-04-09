import DashboardLayout from '@/components/layout/DashboardLayout';


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { TableSkeleton } from '@/components/ui/table-skeleton';

export default function ServicesPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [isCreating, setIsCreating] = useState(false);
    const [newService, setNewService] = useState({
        name: '',
        category: '',
        min_price: '',
        max_price: '',
        fixed_price: '',
        is_fixed: false,
        description: ''
    });

    const { data: services, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await api.get('/services');
            return res.data;
        },
    });

    const updateService = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put(`/services/${data.id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            setEditingId(null);
        },
    });

    const createService = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/services', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            setIsCreating(false);
            setNewService({
                name: '',
                category: '',
                min_price: '',
                max_price: '',
                fixed_price: '',
                is_fixed: false,
                description: ''
            });
        },
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <TableSkeleton columns={6} rows={10} />
            </DashboardLayout>
        );
    }

    const startEdit = (service: any) => {
        setEditingId(service.id);
        setEditForm({ ...service });
    };

    const handleUpdate = () => {
        updateService.mutate(editForm);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createService.mutate({
            ...newService,
            min_price: parseFloat(newService.min_price),
            max_price: parseFloat(newService.max_price),
            fixed_price: newService.fixed_price ? parseFloat(newService.fixed_price) : null
        });
    };

    // If not manager, show access denied or redirect (though sidebar hides link)
    if (user && user.role !== 'manager') {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-red-500">Access Denied. Manager only.</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
        <div className="w-full space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Services & Pricing</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage service offerings and price ranges.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="w-full sm:w-auto bg-black hover:bg-gray-900 shadow-lg shadow-gray-900/10">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </Button>
            </div>

            {isCreating && (
                <Card className="border-red-100 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader className="bg-red-50/50 border-b border-red-50 pb-4">
                        <CardTitle className="text-base font-semibold text-red-900">New Service</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Service Name</Label>
                                    <Input
                                        value={newService.name}
                                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                                        required
                                        placeholder="e.g. Oil Change"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input
                                        value={newService.category}
                                        onChange={e => setNewService({ ...newService, category: e.target.value })}
                                        required
                                        placeholder="e.g. Mechanical"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Min Price (GH₵)</Label>
                                    <Input
                                        type="number"
                                        value={newService.min_price}
                                        onChange={e => setNewService({ ...newService, min_price: e.target.value })}
                                        required
                                        placeholder="0.00"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Price (GH₵)</Label>
                                    <Input
                                        type="number"
                                        value={newService.max_price}
                                        onChange={e => setNewService({ ...newService, max_price: e.target.value })}
                                        required
                                        placeholder="0.00"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-red-600 hover:bg-red-50">Cancel</Button>
                                <Button type="submit" disabled={createService.isPending} className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/10">
                                    {createService.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                    Save Service
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
                {services?.map((service: any) => (
                    <Card key={service.id} className="border-gray-100 shadow-sm">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-gray-900">{service.name}</div>
                                    <Badge variant="secondary" className="mt-1">{service.category}</Badge>
                                </div>
                                <Badge variant={service.is_active ? 'success' : 'secondary'}>
                                    {service.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-50 text-sm">
                                <div className="text-gray-500">
                                    GH₵{service.min_price} — GH₵{service.max_price}
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => startEdit(service)} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block border-gray-100 shadow-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#f8fafc] text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 whitespace-nowrap">Service Name</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Category</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Min Price (GH₵)</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Max Price (GH₵)</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {services?.map((service: any) => (
                                    <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {editingId === service.id ? (
                                                <Input
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="h-8"
                                                />
                                            ) : service.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === service.id ? (
                                                <Input
                                                    value={editForm.category}
                                                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="h-8"
                                                />
                                            ) : (
                                                <Badge variant="secondary">{service.category}</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === service.id ? (
                                                <Input
                                                    type="number"
                                                    value={editForm.min_price}
                                                    onChange={e => setEditForm({ ...editForm, min_price: e.target.value })}
                                                    className="h-8 w-24"
                                                />
                                            ) : service.min_price}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === service.id ? (
                                                <Input
                                                    type="number"
                                                    value={editForm.max_price}
                                                    onChange={e => setEditForm({ ...editForm, max_price: e.target.value })}
                                                    className="h-8 w-24"
                                                />
                                            ) : service.max_price}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={service.is_active ? 'success' : 'secondary'}>
                                                {service.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingId === service.id ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" onClick={handleUpdate} disabled={updateService.isPending} className="bg-red-600 hover:bg-red-700 text-white">
                                                        <Save className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => startEdit(service)} className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {(!services || services.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <Plus className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No services yet</h3>
                                                <p className="text-sm text-gray-500 mt-1">Add your first service to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
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
