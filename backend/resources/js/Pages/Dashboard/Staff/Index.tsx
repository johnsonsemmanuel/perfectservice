import DashboardLayout from '@/components/layout/DashboardLayout';


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Users, Plus, Edit2, Trash2, Key, Shield, Mail, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function StaffPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role_id: '',
        pin: '',
        is_active: true
    });

    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data;
        }
    });

    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const res = await api.get('/users/roles');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post('/users', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast('success', 'Success', 'User created successfully');
            closeModal();
        },
        onError: (err: any) => {
            toast('error', 'Error', err.response?.data?.message || 'Failed to create user');
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => api.put(`/users/${editingUser.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast('success', 'Success', 'User updated successfully');
            closeModal();
        },
        onError: (err: any) => {
            toast('error', 'Error', err.response?.data?.message || 'Failed to update user');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast('success', 'Success', 'User deleted successfully');
        },
        onError: (err: any) => {
            toast('error', 'Error', err.response?.data?.message || 'Failed to delete user');
        }
    });

    const openModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role_id: user.role_id?.toString() || '',
                pin: '',
                is_active: user.is_active
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role_id: '',
                pin: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: any = { ...formData };
        if (!data.password) delete data.password;
        if (!data.pin) delete data.pin;

        if (editingUser) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading staff...</div></DashboardLayout>;

    const selectedRole = roles?.find((r: any) => r.id.toString() === formData.role_id);

    return (
        <DashboardLayout>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system users and their access levels.</p>
                </div>
                <Button onClick={() => openModal()} className="bg-red-600 hover:bg-red-700 text-white gap-2 shadow-lg shadow-red-900/10">
                    <Plus className="w-4 h-4" />
                    Add Staff Member
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black text-white uppercase tracking-wider text-[10px] font-bold">
                                <tr>
                                    <th className="py-4 px-6">Name</th>
                                    <th className="py-4 px-6">Email</th>
                                    <th className="py-4 px-6">Role</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users?.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shadow-sm border border-red-100 group-hover:scale-110 transition-transform">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-900">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 font-medium">{user.email}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-lg w-fit border border-gray-200/50 shadow-sm">
                                                <Shield className="w-3.5 h-3.5 text-gray-500" />
                                                <span className="text-[10px] font-extrabold text-gray-700 uppercase tracking-widest">
                                                    {user.role?.display_name || user.role?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={user.is_active ? 'active' : 'inactive'} type="user" />
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openModal(user)}
                                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to remove this staff member?')) {
                                                        deleteMutation.mutate(user.id);
                                                    }
                                                }}
                                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" onClick={closeModal} />
                    <Card className="relative w-full max-w-md bg-white shadow-2xl animate-in zoom-in-95 duration-200 border-none overflow-hidden">
                        <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
                                <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-900/20">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                {editingUser ? 'Edit Staff Member' : 'New Staff Member'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <UserIcon className="w-3.5 h-3.5" /> Full Name
                                    </label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Full name of staff member"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" /> Email Address
                                    </label>
                                    <Input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Key className="w-3.5 h-3.5" /> Password
                                        </label>
                                        <Input
                                            required={!editingUser}
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder={editingUser ? '••••' : 'Password'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Key className="w-3.5 h-3.5" /> System PIN
                                        </label>
                                        <Input
                                            maxLength={4}
                                            value={formData.pin}
                                            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                                            placeholder="4 digits"
                                            className="font-mono text-center tracking-widest"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5" /> Assign Role
                                    </label>
                                    <Select
                                        value={formData.role_id}
                                        onValueChange={(val: string) => setFormData({ ...formData, role_id: val })}
                                    >
                                        <SelectTrigger className="bg-gray-50/50 hover:bg-white transition-colors">
                                            <SelectValue placeholder="Select staff role..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles?.map((role: { id: number, name: string, display_name?: string }) => (
                                                <SelectItem key={role.id} value={role.id.toString()}>
                                                    {role.display_name || role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 text-red-600 border-gray-300 rounded-lg focus:ring-red-500 cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">Account Status: Active</label>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <Button type="button" variant="ghost" onClick={closeModal} className="flex-1 text-gray-500 hover:bg-gray-50">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-black hover:bg-gray-900 text-white font-bold h-11" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {editingUser ? 'Update Account' : 'Create Account'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        </DashboardLayout>
    );
}
