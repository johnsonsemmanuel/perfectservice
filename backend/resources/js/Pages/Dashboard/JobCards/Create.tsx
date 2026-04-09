import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from '@inertiajs/react';
import api from '@/lib/axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

// ── Debounce hook ──────────────────────────────────────────────────────────────
function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ── Customer search dropdown ───────────────────────────────────────────────────
function CustomerSearch({ search, onSelect }: { search: string; onSelect: (c: any) => void }) {
    const debouncedSearch = useDebounce(search, 350);
    const { data, isLoading } = useQuery({
        queryKey: ['customer-search', debouncedSearch],
        queryFn: async () => {
            const res = await api.get('/customers', { params: { search: debouncedSearch } });
            return res.data;
        },
        enabled: debouncedSearch.length > 2,
    });

    const customers = data?.data ?? [];

    return (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
            {isLoading ? (
                <div className="p-3 text-xs text-center text-gray-500">Searching...</div>
            ) : customers.length === 0 ? (
                <div className="p-3 text-xs text-center text-gray-500">No existing customers found — will create new.</div>
            ) : (
                customers.map((c: any) => (
                    <div key={c.id} onClick={() => onSelect(c)}
                        className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.phone}</p>
                    </div>
                ))
            )}
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CreateJobCard() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [error, setError] = useState('');

    // Pre-fill from query params (e.g. coming from customer profile)
    const urlParams = new URLSearchParams(window.location.search);
    const preCustomerId = urlParams.get('customer_id') ?? '';
    const preCustomerName = urlParams.get('customer_name') ?? '';
    const preCustomerPhone = urlParams.get('customer_phone') ?? '';

    const [form, setForm] = useState({
        vehicle_number: '',
        vehicle_make: '',
        vehicle_model: '',
        customer_id: preCustomerId,
        customer_name: preCustomerName,
        customer_phone: preCustomerPhone,
        customer_email: '',
        technician: '',
        notes: '',
    });

    const [items, setItems] = useState<any[]>([]);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);

    const { data: makes } = useQuery({
        queryKey: ['vehicle-makes'],
        queryFn: async () => (await api.get('/vehicle-makes')).data,
    });

    const { data: models, isLoading: loadingModels } = useQuery({
        queryKey: ['vehicle-models', form.vehicle_make],
        queryFn: async () => {
            const make = makes?.find((m: any) => m.name === form.vehicle_make);
            if (!make) return [];
            return (await api.get(`/vehicle-makes/${make.id}/models`)).data;
        },
        enabled: !!form.vehicle_make && !!makes,
    });

    const { data: servicesData } = useQuery({
        queryKey: ['services'],
        queryFn: async () => (await api.get('/services')).data,
    });
    const services = servicesData?.data ?? servicesData ?? [];

    const createMutation = useMutation({
        mutationFn: (payload: any) => api.post('/job-cards', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-cards'] });
            toast('success', 'Job card created!');
            router.visit('/dashboard/job-cards');
        },
        onError: (e: any) => {
            const msg = e.response?.data?.message ?? 'Failed to create job card.';
            setError(msg);
            toast('error', 'Failed', msg);
        },
    });

    const addItem = () => setItems(prev => [...prev, { service_id: '', agreed_price: '', quantity: 1, notes: '' }]);
    const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
    const updateItem = (i: number, field: string, value: any) => {
        setItems(prev => {
            const next = [...prev];
            next[i] = { ...next[i], [field]: value };
            if (field === 'service_id') {
                const svc = services.find((s: any) => s.id == value);
                if (svc) next[i].agreed_price = svc.is_fixed ? svc.fixed_price : svc.min_price ?? '';
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (items.length === 0) { setError('Add at least one service.'); return; }
        createMutation.mutate({
            ...form,
            items: items.map(it => ({
                service_id: it.service_id,
                agreed_price: parseFloat(it.agreed_price),
                quantity: parseInt(it.quantity) || 1,
                notes: it.notes,
            })),
        });
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="pl-0">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">New Job Card</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Create a new vehicle service order</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
                        <AlertCircle className="w-5 h-5 shrink-0" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Vehicle */}
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-50">
                                <CardTitle className="text-base">Vehicle Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label>Vehicle Number *</Label>
                                    <Input value={form.vehicle_number}
                                        onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value }))}
                                        placeholder="e.g. GR-1234-24" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Make *</Label>
                                        <select required value={form.vehicle_make}
                                            onChange={e => setForm(f => ({ ...f, vehicle_make: e.target.value, vehicle_model: '' }))}
                                            className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-red-400">
                                            <option value="">Select make...</option>
                                            {makes?.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Model *</Label>
                                        <select required value={form.vehicle_model}
                                            onChange={e => setForm(f => ({ ...f, vehicle_model: e.target.value }))}
                                            disabled={!form.vehicle_make || loadingModels}
                                            className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-red-400 disabled:bg-gray-50 disabled:text-gray-400">
                                            <option value="">{loadingModels ? 'Loading...' : 'Select model...'}</option>
                                            {models?.map((m: any) => <option key={m.id} value={m.name}>{m.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Assigned Technician</Label>
                                    <Input value={form.technician}
                                        onChange={e => setForm(f => ({ ...f, technician: e.target.value }))}
                                        placeholder="Technician name (optional)" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer */}
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader className="pb-3 border-b border-gray-50">
                                <CardTitle className="text-base">Customer Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="relative space-y-1.5">
                                    <Label>Customer Name *</Label>
                                    <div className="relative">
                                        <Input value={form.customer_name} required
                                            onChange={e => {
                                                setForm(f => ({ ...f, customer_name: e.target.value, customer_id: '' }));
                                                setShowCustomerSearch(e.target.value.length > 2);
                                            }}
                                            onBlur={() => setTimeout(() => setShowCustomerSearch(false), 200)}
                                            placeholder="Type to search existing customers..."
                                            className={form.customer_id ? 'border-green-400 ring-1 ring-green-300' : ''} />
                                        {form.customer_id && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                Linked
                                            </span>
                                        )}
                                    </div>
                                    {showCustomerSearch && (
                                        <CustomerSearch search={form.customer_name} onSelect={c => {
                                            setForm(f => ({ ...f, customer_name: c.name, customer_phone: c.phone ?? '', customer_email: c.email ?? '', customer_id: c.id }));
                                            setShowCustomerSearch(false);
                                        }} />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label>Phone *</Label>
                                        <Input value={form.customer_phone} required
                                            onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))}
                                            placeholder="024XXXXXXX"
                                            readOnly={!!form.customer_id}
                                            className={form.customer_id ? 'bg-gray-50' : ''} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Email</Label>
                                        <Input type="email" value={form.customer_email}
                                            onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))}
                                            placeholder="Optional"
                                            readOnly={!!form.customer_id}
                                            className={form.customer_id ? 'bg-gray-50' : ''} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Notes</Label>
                                    <textarea value={form.notes}
                                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                        placeholder="Any additional notes..."
                                        className="w-full h-16 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 ring-red-400 bg-gray-50 focus:bg-white" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Services */}
                    <Card className="border-gray-100 shadow-sm">
                        <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Services & Pricing</CardTitle>
                            <Button type="button" onClick={addItem} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-1" /> Add Service
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            {items.length === 0 ? (
                                <div className="py-8 text-center text-gray-400">
                                    <p className="text-sm">No services added yet.</p>
                                    <p className="text-xs mt-1">Click "Add Service" to begin.</p>
                                </div>
                            ) : (
                                items.map((item, idx) => {
                                    const svc = services.find((s: any) => s.id == item.service_id);
                                    return (
                                        <div key={idx} className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            {/* Service select */}
                                            <div className="col-span-12 sm:col-span-5 space-y-1">
                                                <Label className="text-xs">Service *</Label>
                                                <select required value={item.service_id}
                                                    onChange={e => updateItem(idx, 'service_id', e.target.value)}
                                                    className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 ring-red-400">
                                                    <option value="">Select service...</option>
                                                    {services.map((s: any) => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                                {svc && (
                                                    <p className="text-[10px] text-gray-400">
                                                        {svc.category} · {svc.is_fixed ? `Fixed GH₵${svc.fixed_price}` : `GH₵${svc.min_price}–${svc.max_price}`}
                                                    </p>
                                                )}
                                            </div>
                                            {/* Price */}
                                            <div className="col-span-5 sm:col-span-2 space-y-1">
                                                <Label className="text-xs">Price (GH₵) *</Label>
                                                <Input type="number" required min={0} step="0.01"
                                                    value={item.agreed_price}
                                                    onChange={e => updateItem(idx, 'agreed_price', e.target.value)}
                                                    disabled={svc?.is_fixed}
                                                    className={svc?.is_fixed ? 'bg-gray-100' : ''} />
                                            </div>
                                            {/* Qty */}
                                            <div className="col-span-3 sm:col-span-1 space-y-1">
                                                <Label className="text-xs">Qty</Label>
                                                <Input type="number" min={1} value={item.quantity}
                                                    onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                            </div>
                                            {/* Notes */}
                                            <div className="col-span-12 sm:col-span-3 space-y-1">
                                                <Label className="text-xs">Notes</Label>
                                                <Input value={item.notes} placeholder="Optional"
                                                    onChange={e => updateItem(idx, 'notes', e.target.value)} />
                                            </div>
                                            {/* Remove */}
                                            <div className="col-span-1 flex items-end pb-0.5">
                                                <button type="button" onClick={() => removeItem(idx)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {items.length > 0 && (
                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                    <div className="text-sm font-bold text-gray-900">
                                        Estimated Total: <span className="text-red-600">
                                            GH₵{items.reduce((s, i) => s + (parseFloat(i.agreed_price) || 0) * (parseInt(i.quantity) || 1), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" disabled={createMutation.isPending} className="min-w-32">
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Job Card
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
