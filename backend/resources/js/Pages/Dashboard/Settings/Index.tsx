import DashboardLayout from '@/components/layout/DashboardLayout';


import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Loader2, Upload, Save, Building2, Wallet, Receipt, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SettingsSkeleton } from '@/components/dashboard/SettingsSkeleton';
import { cn } from '@/lib/utils';

// --- Components ---

interface SettingsFormProps {
    initialValues: any;
    onSave: (data: any) => void;
    isLoading: boolean;
    children: React.ReactNode;
    title: string;
    description: string;
}

function SettingsForm({ initialValues, onSave, isLoading, children, title, description }: SettingsFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: any = {};
        formData.forEach((value, key) => {
            if (typeof value === 'string') {
                data[key] = value;
            }
        });
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                    <CardTitle className="text-xl text-red-900">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {children}
                </CardContent>
                <div className="flex justify-end p-6 pt-0 bg-gray-50/30 border-t border-gray-100 mt-6 py-4">
                    <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/10">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </form>
    );
}

// --- Main Page ---

export default function SettingsPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('company');

    // Fetch Settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            const settingsMap: any = {};
            res.data.forEach((s: any) => settingsMap[s.key] = s.value);
            return settingsMap;
        },
    });

    // Update Settings Mutation
    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const settingsArray = Object.keys(data).map(key => ({
                key,
                value: data[key]
            }));
            await api.put('/settings', { settings: settingsArray });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast('success', 'Settings saved successfully');
        },
        onError: () => {
            toast('error', 'Failed to save settings');
        }
    });

    // Logo Upload
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('logo', file);
        setUploading(true);
        try {
            await api.post('/settings/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast('success', 'Logo uploaded successfully');
        } catch (error) {
            toast('error', 'Logo upload failed');
        } finally {
            setUploading(false);
        }
    };

    if (isLoading) return <SettingsSkeleton />;
    if (user && user.role !== 'manager') return <div className="p-8 text-center text-red-500">Access Denied.</div>;

    const navItems = [
        { id: 'company', label: 'Company Profile', icon: Building2 },
        { id: 'financials', label: 'Financials & Terms', icon: Wallet },
        { id: 'receipt', label: 'Receipt Configuration', icon: Receipt },
    ];

    return (
        <DashboardLayout>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your organization details and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 space-y-2">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    activeTab === item.id
                                        ? "bg-black text-white shadow-md shadow-gray-900/20"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-4 h-4", activeTab === item.id ? "text-red-400" : "text-gray-400")} />
                                    {item.label}
                                </div>
                                {activeTab === item.id && <ChevronRight className="w-4 h-4 text-red-400" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Right Content Area */}
                <main className="flex-1 w-full min-w-0">
                    {activeTab === 'company' && (
                        <SettingsForm
                            title="Company Profile"
                            description="Update your company branding and contact information."
                            initialValues={{}} // Handled by defaultValues
                            onSave={updateMutation.mutate}
                            isLoading={updateMutation.isPending}
                        >
                            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-red-50/50 rounded-xl border border-red-50/50">
                                <div className="shrink-0">
                                    <div className="w-24 h-24 bg-white rounded-lg border border-red-100 flex items-center justify-center overflow-hidden relative group">
                                        {settings?.company_logo ? (
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${settings.company_logo}`}
                                                alt="Logo"
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-red-200" />
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploading}
                                        />
                                    </div>
                                    {uploading && <p className="text-xs text-center mt-2 text-red-600 animate-pulse">Uploading...</p>}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-medium text-gray-900">Company Logo</h3>
                                    <p className="text-sm text-gray-500">Upload your company logo. Recommended size: 400x400px.</p>
                                    <Button variant="outline" size="sm" className="mt-2 text-xs" type="button" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                                        Change Logo
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        name="business_name"
                                        defaultValue={settings?.business_name}
                                        placeholder="e.g. Perfect Service Auto Center"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            name="business_phone"
                                            defaultValue={settings?.business_phone}
                                            placeholder="e.g. 024 123 4567"
                                            className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            name="business_email"
                                            defaultValue={settings?.business_email}
                                            placeholder="e.g. contact@perfectservice.com"
                                            className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Textarea
                                        name="business_address"
                                        defaultValue={settings?.business_address}
                                        placeholder="Enter full business address"
                                        className="min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </SettingsForm>
                    )}

                    {activeTab === 'financials' && (
                        <SettingsForm
                            title="Financials & Terms"
                            description="Configure tax rates, currency, and invoice terms."
                            initialValues={{}}
                            onSave={updateMutation.mutate}
                            isLoading={updateMutation.isPending}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Tax Rate (%)</Label>
                                    <Input
                                        name="default_tax_percent"
                                        type="number"
                                        step="0.01"
                                        defaultValue={settings?.default_tax_percent}
                                        placeholder="0.00"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency Symbol</Label>
                                    <Input
                                        name="currency_symbol"
                                        defaultValue={settings?.currency_symbol}
                                        placeholder="e.g. GH₵"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Instructions</Label>
                                <Textarea
                                    name="payment_instructions"
                                    defaultValue={settings?.payment_instructions}
                                    placeholder="e.g. Bank Name: GCB Bank, Account: 1234567890"
                                    className="min-h-[100px] bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500">This text will appear on invoices.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Terms & Conditions</Label>
                                <Textarea
                                    name="terms_conditions"
                                    defaultValue={settings?.terms_conditions}
                                    placeholder="e.g. Payment is due within 14 days..."
                                    className="min-h-[150px] bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                                <p className="text-xs text-gray-500">Legal terms displayed on job cards and invoices.</p>
                            </div>
                        </SettingsForm>
                    )}

                    {activeTab === 'receipt' && (
                        <SettingsForm
                            title="Receipt Configuration"
                            description="Customize the footer text for thermal receipts."
                            initialValues={{}}
                            onSave={updateMutation.mutate}
                            isLoading={updateMutation.isPending}
                        >
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Footer Line 1</Label>
                                    <Input
                                        name="receipt_footer_line_1"
                                        defaultValue={settings?.receipt_footer_line_1}
                                        placeholder="e.g. Thank you for your business!"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer Line 2</Label>
                                    <Input
                                        name="receipt_footer_line_2"
                                        defaultValue={settings?.receipt_footer_line_2}
                                        placeholder="e.g. Goods sold are not returnable."
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Footer Line 3</Label>
                                    <Input
                                        name="receipt_footer_line_3"
                                        defaultValue={settings?.receipt_footer_line_3}
                                        placeholder="e.g. Call us: 024 123 4567"
                                        className="h-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>
                        </SettingsForm>
                    )}
                </main>
            </div>
        </div>
        </DashboardLayout>
    );
}
