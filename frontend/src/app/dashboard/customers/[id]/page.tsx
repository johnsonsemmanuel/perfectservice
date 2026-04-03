'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Phone, Mail, MapPin, Car, DollarSign, FileText, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { use } from 'react';

import { DetailSkeleton } from '@/components/dashboard/DetailSkeleton';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const queryClient = useQueryClient();
    const customerId = id;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });

    const { data, isLoading } = useQuery({
        queryKey: ['customers', customerId],
        queryFn: async () => {
            const res = await api.get(`/customers/${customerId}`);
            return res.data;
        },
    });

    // Initialize form data when data loads
    useEffect(() => {
        if (data?.customer) {
            setFormData({
                name: data.customer.name || '',
                phone: data.customer.phone || '',
                email: data.customer.email || '',
                address: data.customer.address || ''
            });
        }
    }, [data]);

    const updateCustomer = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.put(`/customers/${customerId}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers', customerId] });
            setIsEditing(false);
        },
    });

    const handleSave = () => {
        updateCustomer.mutate(formData);
    };

    if (isLoading) return <DetailSkeleton />;
    if (!data) return <div className="p-8 text-center text-red-500">Customer not found.</div>;

    const { customer, stats } = data;

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Customer Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader className="bg-gray-50/50 pb-8 border-b border-gray-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-4">
                                {customer.name.substring(0, 2).toUpperCase()}
                            </div>
                            {isEditing ? (
                                <Input
                                    className="text-center font-bold text-lg h-9 mt-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            ) : (
                                <CardTitle className="text-xl">{customer.name}</CardTitle>
                            )}
                            <p className="text-sm text-gray-500 mt-1">Customer since {new Date(customer.created_at).getFullYear()}</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Contact Info</Label>
                                {isEditing ? (
                                    <>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Phone</Label>
                                            <Input
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Email</Label>
                                            <Input
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Address</Label>
                                            <Input
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {customer.phone && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        )}
                                        {customer.email && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{customer.email}</span>
                                            </div>
                                        )}
                                        {customer.address && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span>{customer.address}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={handleSave}
                                        disabled={updateCustomer.isPending}
                                    >
                                        {updateCustomer.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Save
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button className="w-full" variant="outline" onClick={() => setIsEditing(true)}>Edit Details</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Stats & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-green-50 rounded-full text-green-600">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                                    <p className="text-2xl font-bold">GH₵{stats.total_spent.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                    <Car className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Visits</p>
                                    <p className="text-2xl font-bold">{stats.total_visits}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Jobs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                Recent Job Cards
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-100">
                                {customer.job_cards?.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">No job history found.</div>
                                ) : customer.job_cards?.map((job: any) => (
                                    <div key={job.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{job.job_number}</span>
                                                <Badge variant="outline" className="text-xs">{job.status}</Badge>
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                <Car className="w-3 h-3" />
                                                {job.vehicle_make} {job.vehicle_model} ({job.vehicle_number})
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="text-gray-500">{new Date(job.created_at).toLocaleDateString()}</p>
                                            <Link href={`/dashboard/job-cards/${job.id}`} className="text-primary hover:underline font-medium">
                                                View Job
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
