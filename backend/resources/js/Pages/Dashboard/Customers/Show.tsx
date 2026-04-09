import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@inertiajs/react';
import api from '@/lib/axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast';
import {
    ArrowLeft, Phone, Mail, MapPin, Car, Plus, Edit2,
    Trash2, X, Loader2, ClipboardList, Wallet, Clock,
    TrendingUp, AlertCircle,
} from 'lucide-react';

interface Vehicle {
    id: number;
    registration: string;
    make: string | null;
    model: string | null;
    year: string | null;
    color: string | null;
    vin: string | null;
    notes: string | null;
}

const emptyVehicle = { registration: '', make: '', model: '', year: '', color: '', vin: '', notes: '' };

export default function CustomerShowPage() {
    const { id } = usePage().props as any;
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [vehicleForm, setVehicleForm] = useState(emptyVehicle);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['customer', id],
        queryFn: async () => {
            const res = await api.get(`/customers/${id}`);
            return res.data;
        },
    });

    const customer = data?.customer;
    const stats = data?.stats;

    const addVehicle = useMutation({
        mutationFn: (form: typeof emptyVehicle) => api.post(`/customers/${id}/vehicles`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            toast('success', 'Vehicle added');
            setShowVehicleForm(false);
            setVehicleForm(emptyVehicle);
        },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Try again'),
    });

    const updateVehicle = useMutation({
        mutationFn: (form: typeof emptyVehicle & { id: number }) =>
            api.put(`/customers/${id}/vehicles/${form.id}`, form),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            toast('success', 'Vehicle updated');
            setEditingVehicle(null);
        },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Try again'),
    });

    const deleteVehicle = useMutation({
        mutationFn: (vehicleId: number) => api.delete(`/customers/${id}/vehicles/${vehicleId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer', id] });
            toast('success', 'Vehicle removed');
        },
    });

    const handleVehicleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingVehicle) {
            updateVehicle.mutate({ ...vehicleForm, id: editingVehicle.id });
        } else {
            addVehicle.mutate(vehicleForm);
        }
    };

    const startEdit = (v: Vehicle) => {
        setEditingVehicle(v);
        setVehicleForm({
            registration: v.registration,
            make: v.make ?? '',
            model: v.model ?? '',
            year: v.year ?? '',
            color: v.color ?? '',
            vin: v.vin ?? '',
            notes: v.notes ?? '',
        });
        setShowVehicleForm(true);
    };

    const cancelForm = () => {
        setShowVehicleForm(false);
        setEditingVehicle(null);
        setVehicleForm(emptyVehicle);
    };

    if (isLoading) return (
        <DashboardLayout>
            <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-gray-100 rounded-xl" />
                <div className="h-40 bg-gray-100 rounded-2xl" />
                <div className="h-64 bg-gray-100 rounded-2xl" />
            </div>
        </DashboardLayout>
    );

    if (isError || !customer) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                <p className="font-semibold text-gray-900">Customer not found</p>
                <Link href="/dashboard/customers" className="mt-4 text-sm text-red-600 hover:underline">
                    ← Back to customers
                </Link>
            </div>
        </DashboardLayout>
    );

    const initials = customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Back */}
                <Link href="/dashboard/customers"
                    className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
                </Link>

                {/* Profile header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-md shadow-red-600/20">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                                {customer.phone && (
                                    <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
                                        <Phone className="w-3.5 h-3.5" /> {customer.phone}
                                    </span>
                                )}
                                {customer.email && (
                                    <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
                                        <Mail className="w-3.5 h-3.5" /> {customer.email}
                                    </span>
                                )}
                                {customer.address && (
                                    <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
                                        <MapPin className="w-3.5 h-3.5" /> {customer.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
                        {[
                            { label: 'Total Spent', value: `GH₵${Number(stats?.total_spent ?? 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600' },
                            { label: 'Total Visits', value: stats?.total_visits ?? 0, icon: ClipboardList, color: 'text-blue-600' },
                            { label: 'Open Jobs', value: stats?.open_jobs ?? 0, icon: Clock, color: 'text-amber-600' },
                            { label: 'Last Visit', value: stats?.last_visit ? new Date(stats.last_visit).toLocaleDateString() : '—', icon: Wallet, color: 'text-gray-500' },
                        ].map(s => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                                        <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                                    </div>
                                    <p className="text-[15px] font-bold text-gray-900">{s.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Vehicles */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                                <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
                                    <Car className="w-4 h-4 text-gray-400" /> Vehicles
                                </h2>
                                <button
                                    onClick={() => { cancelForm(); setShowVehicleForm(true); }}
                                    className="inline-flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>

                            {/* Vehicle form */}
                            {showVehicleForm && (
                                <form onSubmit={handleVehicleSubmit} className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
                                    <p className="text-[12px] font-semibold text-gray-700">
                                        {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
                                    </p>
                                    <div className="space-y-2">
                                        <Label className="text-[11px]">Registration *</Label>
                                        <Input value={vehicleForm.registration} required
                                            onChange={e => setVehicleForm(f => ({ ...f, registration: e.target.value }))}
                                            placeholder="e.g. GR-1234-24" className="h-8 text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Make</Label>
                                            <Input value={vehicleForm.make}
                                                onChange={e => setVehicleForm(f => ({ ...f, make: e.target.value }))}
                                                placeholder="Toyota" className="h-8 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Model</Label>
                                            <Input value={vehicleForm.model}
                                                onChange={e => setVehicleForm(f => ({ ...f, model: e.target.value }))}
                                                placeholder="Corolla" className="h-8 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Year</Label>
                                            <Input value={vehicleForm.year}
                                                onChange={e => setVehicleForm(f => ({ ...f, year: e.target.value }))}
                                                placeholder="2019" className="h-8 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[11px]">Color</Label>
                                            <Input value={vehicleForm.color}
                                                onChange={e => setVehicleForm(f => ({ ...f, color: e.target.value }))}
                                                placeholder="Silver" className="h-8 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[11px]">VIN / Chassis</Label>
                                        <Input value={vehicleForm.vin}
                                            onChange={e => setVehicleForm(f => ({ ...f, vin: e.target.value }))}
                                            placeholder="Optional" className="h-8 text-sm" />
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Button type="button" variant="outline" size="sm" onClick={cancelForm} className="flex-1">
                                            <X className="w-3 h-3 mr-1" /> Cancel
                                        </Button>
                                        <Button type="submit" size="sm" className="flex-1"
                                            disabled={addVehicle.isPending || updateVehicle.isPending}>
                                            {(addVehicle.isPending || updateVehicle.isPending)
                                                ? <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                : null}
                                            Save
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Vehicle list */}
                            <div className="divide-y divide-gray-50">
                                {customer.vehicles?.length === 0 && !showVehicleForm && (
                                    <div className="px-5 py-8 text-center text-[13px] text-gray-400">
                                        No vehicles registered yet
                                    </div>
                                )}
                                {customer.vehicles?.map((v: Vehicle) => (
                                    <div key={v.id} className="px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                                <Car className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-semibold text-gray-900">{v.registration}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {[v.year, v.make, v.model, v.color].filter(Boolean).join(' · ')}
                                                </p>
                                                {v.vin && <p className="text-[10px] text-gray-300 mt-0.5 font-mono">VIN: {v.vin}</p>}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button onClick={() => startEdit(v)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => confirm('Remove this vehicle?') && deleteVehicle.mutate(v.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Job history */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-[13px] font-semibold text-gray-900 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 text-gray-400" /> Service History
                            </h2>
                            <Link href={`/dashboard/job-cards/create`}
                                className="inline-flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700">
                                <Plus className="w-3.5 h-3.5" /> New Job
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr>
                                        {['Job #', 'Vehicle', 'Services', 'Date', 'Status', 'Invoice'].map((h, i) => (
                                            <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 ${i === 0 ? 'pl-6' : ''} ${i === 5 ? 'pr-6' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {customer.job_cards?.map((job: any) => (
                                        <tr key={job.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                            <td className="py-3 pl-6 pr-4">
                                                <Link href={`/dashboard/job-cards/${job.id}`}
                                                    className="font-semibold text-gray-900 hover:text-red-600 transition-colors">
                                                    {job.job_number}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{job.vehicle_number}</td>
                                            <td className="py-3 px-4 text-gray-500 text-[12px]">
                                                {job.items?.slice(0, 2).map((i: any) => i.service?.name).filter(Boolean).join(', ')}
                                                {job.items?.length > 2 && ` +${job.items.length - 2} more`}
                                            </td>
                                            <td className="py-3 px-4 text-[12px] text-gray-400">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <StatusBadge status={job.status} type="job" />
                                            </td>
                                            <td className="py-3 px-4 pr-6">
                                                {job.invoice ? (
                                                    <Link href={`/dashboard/invoices/${job.invoice.id}`}
                                                        className="text-[12px] font-semibold text-blue-600 hover:underline">
                                                        {job.invoice.invoice_number}
                                                    </Link>
                                                ) : (
                                                    <span className="text-[12px] text-gray-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!customer.job_cards?.length && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-[13px] text-gray-400">
                                                No service history yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
