'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Ensure this uses correct import
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';

function CustomerSearchResults({ search, onSelect }: { search: string, onSelect: (c: any) => void }) {
    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers', search],
        queryFn: async () => {
            // Debounce is handled by parent strictly controlling render, but here we just fetch
            // In a real app, use useDebounce or similar
            const res = await api.get('/customers', { params: { search } });
            return res.data;
        },
        enabled: search.length > 2
    });

    return (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
            {isLoading ? (
                <div className="p-3 text-xs text-center text-gray-500">Searching...</div>
            ) : customers?.data?.length === 0 ? (
                <div className="p-3 text-xs text-center text-gray-500">No customers found. Creates new.</div>
            ) : (
                customers?.data?.map((customer: any) => (
                    <div
                        key={customer.id}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                        onClick={() => onSelect(customer)}
                    >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                    </div>
                ))
            )}
        </div>
    );
}

export default function CreateJobCardPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        vehicle_number: '',
        vehicle_make: '',
        vehicle_model: '',
        customer_id: '', // Added
        customer_name: '',
        customer_phone: '',
        customer_email: '', // Added
        technician: '',
    });


    const [items, setItems] = useState<any[]>([]);

    // Fetch Vehicle Makes
    const { data: makes } = useQuery({
        queryKey: ['vehicle-makes'],
        queryFn: async () => {
            const res = await api.get('/vehicle-makes');
            return res.data;
        }
    });

    // Fetch Models when make changes
    const { data: models, isLoading: isLoadingModels } = useQuery({
        queryKey: ['vehicle-models', formData.vehicle_make],
        queryFn: async () => {
            if (!formData.vehicle_make) return [];
            // Find make ID
            const make = makes?.find((m: any) => m.name === formData.vehicle_make);
            if (!make) return [];
            const res = await api.get(`/vehicle-makes/${make.id}/models`);
            return res.data;
        },
        enabled: !!formData.vehicle_make && !!makes
    });

    // Fetch Services
    const { data: services } = useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await api.get('/services');
            return res.data;
        }
    });

    // Create Mutation
    const createJobCard = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/job-cards', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-cards'] });
            toast('success', 'Job Card Created!', 'The job card has been created successfully.');
            router.push('/dashboard/job-cards');
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || 'Failed to create job card.';
            setError(msg);
            toast('error', 'Creation Failed', msg);
        }
    });

    const addItem = () => {
        setItems([...items, { service_id: '', agreed_price: '', notes: '' }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill price if service selected
        if (field === 'service_id') {
            const service = services?.find((s: any) => s.id == value);
            if (service) {
                if (service.is_fixed) {
                    newItems[index].agreed_price = service.fixed_price;
                } else {
                    newItems[index].agreed_price = service.min_price; // Default to min
                }
            }
        }
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (items.length === 0) {
            setError('Please add at least one service.');
            return;
        }

        const payload = {
            ...formData,
            items: items.map(item => ({
                service_id: item.service_id,
                agreed_price: parseFloat(item.agreed_price),
                notes: item.notes
            }))
        };

        createJobCard.mutate(payload);
    };

    const getServiceDetails = (serviceId: string) => {
        return services?.find((s: any) => s.id == serviceId);
    };

    return (
        <div className="w-full space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Vehicle Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Vehicle Number</Label>
                                <Input
                                    value={formData.vehicle_number}
                                    onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })}
                                    placeholder="e.g. GR-1234-24"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Make</Label>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        value={formData.vehicle_make}
                                        onChange={e => setFormData({ ...formData, vehicle_make: e.target.value, vehicle_model: '' })}
                                        required
                                    >
                                        <option value="">Select Make...</option>
                                        {makes?.map((m: any) => (
                                            <option key={m.id} value={m.name}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Model</Label>
                                    <select
                                        className="flex h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:bg-gray-50"
                                        value={formData.vehicle_model}
                                        onChange={e => setFormData({ ...formData, vehicle_model: e.target.value })}
                                        required
                                        disabled={!formData.vehicle_make || isLoadingModels}
                                    >
                                        <option value="">{isLoadingModels ? 'Loading...' : 'Select Model...'}</option>
                                        {models?.map((m: any) => (
                                            <option key={m.id} value={m.name}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Details */}
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 text-gray-800 p-3 rounded-md border border-gray-200 text-sm flex gap-3 items-start">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-500" />
                                <div>
                                    <p className="font-semibold">Search Existing Customers</p>
                                    <p className="mt-1 text-gray-600">
                                        Type to search for existing customers. Click a result to link their history. Only enter details manually if the customer is new.
                                    </p>
                                </div>
                            </div>

                            {/* Customer Search */}
                            <div className="space-y-2 relative">
                                <Label>Customer Name / Search</Label>
                                <Input
                                    value={formData.customer_name}
                                    onChange={e => {
                                        setFormData({ ...formData, customer_name: e.target.value, customer_id: '' });
                                        // Simple debounce or just trigger search in effect could be better, but for now simple input
                                    }}
                                    placeholder="Start typing to search existing customers..."
                                    required
                                    className={formData.customer_id ? 'border-green-500 ring-green-500' : ''}
                                />
                                {/* Dropdown for search results would go here, implementing a simple one below */}
                                {formData.customer_name.length > 2 && !formData.customer_id && (
                                    <CustomerSearchResults
                                        search={formData.customer_name}
                                        onSelect={(c: any) => {
                                            setFormData({
                                                ...formData,
                                                customer_name: c.name,
                                                customer_phone: c.phone || '',
                                                customer_email: c.email || '',
                                                customer_id: c.id
                                            });
                                        }}
                                    />
                                )}
                                {formData.customer_id && (
                                    <div className="absolute right-3 top-9">
                                        <Badge variant="success" className="h-5 text-[10px]">Linked</Badge>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={formData.customer_phone}
                                        onChange={e => setFormData({ ...formData, customer_phone: e.target.value })}
                                        placeholder="024XXXXXXX"
                                        required
                                        readOnly={!!formData.customer_id}
                                        className={formData.customer_id ? 'bg-gray-50' : ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Technician</Label>
                                    <Input
                                        value={formData.technician}
                                        onChange={e => setFormData({ ...formData, technician: e.target.value })}
                                        placeholder="Technician Name"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Services */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Services & Pricing</CardTitle>
                        <Button type="button" onClick={addItem} size="sm" variant="secondary">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Service
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.length === 0 && (
                            <p className="text-center text-gray-500 py-4 italic">No services added yet.</p>
                        )}
                        {items.map((item, index) => {
                            const service = getServiceDetails(item.service_id);
                            const isFixed = service?.is_fixed;

                            return (
                                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                                    <div className="flex-1 space-y-2">
                                        <Label>Service</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                            value={item.service_id}
                                            onChange={e => updateItem(index, 'service_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select a service...</option>
                                            {services?.map((s: any) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name} ({s.is_fixed ? 'Fixed' : 'Variable'})
                                                </option>
                                            ))}
                                        </select>
                                        {service && (
                                            <div className="text-xs text-blue-600 flex gap-2">
                                                <Badge variant="secondary" className="text-[10px] px-1 h-5">
                                                    {service.category}
                                                </Badge>
                                                <span>
                                                    Range: GH₵{service.min_price} - GH₵{service.max_price}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-32 space-y-2">
                                        <Label>Price (GH₵)</Label>
                                        <Input
                                            type="number"
                                            value={item.agreed_price}
                                            onChange={e => updateItem(index, 'agreed_price', e.target.value)}
                                            required
                                            min={service?.min_price}
                                            max={service?.max_price}
                                            disabled={isFixed}
                                            className={isFixed ? 'bg-gray-100' : ''}
                                        />
                                    </div>

                                    <div className="w-1/3 space-y-2">
                                        <Label>Notes</Label>
                                        <Input
                                            value={item.notes}
                                            onChange={e => updateItem(index, 'notes', e.target.value)}
                                            placeholder="Optional details"
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mt-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => removeItem(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={createJobCard.isPending} className="w-32">
                        {createJobCard.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Create Job'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
