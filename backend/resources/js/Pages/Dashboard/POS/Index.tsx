import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ShoppingCart, Plus, Minus, Trash2, Loader2, X,
    CheckCircle, Search, Package, AlertTriangle, Edit2,
    DollarSign, Printer, Upload, Image as ImageIcon,
    ArrowDownToLine, History, Receipt, Tag,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Product {
    id: number;
    name: string;
    sku: string;
    category: string | null;
    price: number;
    stock: number;
    low_stock_alert: number;
    description: string | null;
    image_url: string | null;
}
interface CartItem { product: Product; quantity: number; }

// ─── Stock Adjust Modal ────────────────────────────────────────────────────────
function StockAdjustModal({ product, onClose }: { product: Product; onClose: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [qty, setQty] = useState('1');
    const [notes, setNotes] = useState('');
    const [tab, setTab] = useState<'in' | 'history'>('in');

    const { data: movementsData } = useQuery({
        queryKey: ['stock-movements', product.id],
        queryFn: async () => (await api.get(`/products/${product.id}/movements`)).data,
        enabled: tab === 'history',
    });

    const adjust = useMutation({
        mutationFn: () => api.post(`/products/${product.id}/adjust`, { type: 'in', quantity: parseInt(qty), notes }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-products'] });
            queryClient.invalidateQueries({ queryKey: ['stock-movements', product.id] });
            toast('success', 'Stock updated', `Added ${qty} units to ${product.name}`);
            setQty('1'); setNotes('');
        },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Try again'),
    });

    const typeLabel: Record<string, { label: string; color: string }> = {
        in: { label: 'Stock In', color: 'text-emerald-600' },
        out: { label: 'Stock Out', color: 'text-red-600' },
        sale: { label: 'POS Sale', color: 'text-red-500' },
        adjustment: { label: 'Adjustment', color: 'text-amber-600' },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">Current stock: <span className="font-semibold text-gray-700">{product.stock}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <div className="flex border-b border-gray-100">
                    {(['in', 'history'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 text-[13px] font-medium transition-colors ${tab === t ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400 hover:text-gray-600'}`}>
                            {t === 'in' ? 'Add Stock' : 'Movement History'}
                        </button>
                    ))}
                </div>
                {tab === 'in' && (
                    <div className="p-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label>Quantity to Add *</Label>
                            <Input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}
                                className="h-10 text-lg font-bold text-center" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Notes (optional)</Label>
                            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Received from supplier" />
                        </div>
                        <div className="flex gap-3 pt-1">
                            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                            <Button onClick={() => adjust.mutate()} disabled={adjust.isPending || !qty || parseInt(qty) < 1} className="flex-1">
                                {adjust.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowDownToLine className="w-4 h-4 mr-2" />}
                                Add Stock
                            </Button>
                        </div>
                    </div>
                )}
                {tab === 'history' && (
                    <div className="max-h-80 overflow-y-auto">
                        {!movementsData?.data?.length ? (
                            <div className="py-10 text-center text-[13px] text-gray-400">No movement history yet</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {movementsData.data.map((m: any) => {
                                    const t = typeLabel[m.type] ?? { label: m.type, color: 'text-gray-500' };
                                    return (
                                        <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[12px] font-semibold ${t.color}`}>{t.label}</span>
                                                    {m.reference && <span className="text-[11px] text-gray-400 font-mono">{m.reference}</span>}
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-0.5">{m.creator?.name ?? 'System'} · {new Date(m.created_at).toLocaleString()}</p>
                                                {m.notes && <p className="text-[11px] text-gray-500 italic mt-0.5">{m.notes}</p>}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-[14px] font-bold ${m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {m.quantity > 0 ? '+' : ''}{m.quantity}
                                                </p>
                                                <p className="text-[10px] text-gray-400">{m.stock_before} → {m.stock_after}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Product Form Modal ────────────────────────────────────────────────────────
function ProductModal({ product, onClose }: { product?: Product | null; onClose: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const isEdit = !!product;
    const [form, setForm] = useState({
        name: product?.name ?? '', sku: product?.sku ?? '', category: product?.category ?? '',
        price: product?.price?.toString() ?? '', stock: product?.stock?.toString() ?? '0',
        low_stock_alert: product?.low_stock_alert?.toString() ?? '5', description: product?.description ?? '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);
    const [removeImage, setRemoveImage] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        if (imagePreview && !imagePreview.startsWith('http')) URL.revokeObjectURL(imagePreview);
        setImageFile(file); setRemoveImage(false); setImagePreview(URL.createObjectURL(file));
    };
    const handleRemoveImage = () => {
        if (imagePreview && !imagePreview.startsWith('http')) URL.revokeObjectURL(imagePreview);
        setImageFile(null); setImagePreview(null); setRemoveImage(true);
    };

    const save = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            fd.append('name', form.name); fd.append('sku', form.sku); fd.append('category', form.category);
            fd.append('price', String(parseFloat(form.price) || 0));
            fd.append('stock', String(parseInt(form.stock) || 0));
            fd.append('low_stock_alert', String(parseInt(form.low_stock_alert) || 5));
            fd.append('description', form.description);
            if (imageFile) fd.append('image', imageFile);
            if (removeImage) fd.append('remove_image', '1');
            if (isEdit) { fd.append('_method', 'PUT'); return api.post(`/products/${product!.id}`, fd); }
            return api.post('/products', fd);
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pos-products'] }); toast('success', isEdit ? 'Product updated' : 'Product added'); onClose(); },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Try again'),
    });

    const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-600" />{isEdit ? 'Edit Product' : 'Add Product'}
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-5">
                    <div className="space-y-2">
                        <Label>Product Image</Label>
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                {imagePreview ? (
                                    <><img src={imagePreview} alt="Product" className="w-full h-full object-cover rounded-xl" />
                                    <button type="button" onClick={handleRemoveImage} className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4 text-white" /></button></>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 text-gray-300"><ImageIcon className="w-7 h-7" /><span className="text-[10px]">No image</span></div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="flex items-center gap-2 h-9 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors w-fit">
                                    <Upload className="w-3.5 h-3.5" />{imagePreview ? 'Change image' : 'Upload image'}
                                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                                </label>
                                <p className="text-[11px] text-gray-400">JPEG, PNG or WebP · max 2MB</p>
                                {imagePreview && <button type="button" onClick={handleRemoveImage} className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1"><X className="w-3 h-3" /> Remove image</button>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1.5"><Label>Product Name *</Label><Input value={form.name} onChange={f('name')} placeholder="e.g. Engine Oil 5W-30" /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={f('sku')} placeholder="Auto-generated" /></div>
                        <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={f('category')} placeholder="e.g. Lubricants" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5"><Label>Price (GH₵) *</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={f('price')} placeholder="0.00" /></div>
                        <div className="space-y-1.5"><Label>Stock Qty *</Label><Input type="number" min="0" value={form.stock} onChange={f('stock')} placeholder="0" /></div>
                        <div className="space-y-1.5"><Label>Low Alert</Label><Input type="number" min="0" value={form.low_stock_alert} onChange={f('low_stock_alert')} placeholder="5" /></div>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Description</Label>
                        <textarea value={form.description} onChange={f('description')} placeholder="Optional notes..."
                            className="w-full h-16 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 ring-red-400 bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                </div>
                <div className="flex gap-3 p-5 pt-0 sticky bottom-0 bg-white border-t border-gray-50">
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.price} className="flex-1">
                        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{isEdit ? 'Save Changes' : 'Add Product'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Products Management Tab ───────────────────────────────────────────────────
function ProductsTab() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [modalProduct, setModalProduct] = useState<Product | null | undefined>(undefined);
    const [stockProduct, setStockProduct] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['pos-products', search],
        queryFn: async () => (await api.get('/products', { params: { search, per_page: 100 } })).data,
    });
    const products: Product[] = data?.data ?? [];

    const deleteProd = useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['pos-products'] }); toast('success', 'Product removed'); setDeleteTarget(null); },
        onError: () => toast('error', 'Could not delete product'),
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                </div>
                {user?.role === 'manager' && (
                    <Button onClick={() => setModalProduct(null)} className="shrink-0"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-52 rounded-xl bg-gray-100 animate-pulse" />)}
                </div>
            ) : products.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No products yet</p>
                    {user?.role === 'manager' && <p className="text-xs mt-1">Click "Add Product" to get started</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {products.map(p => (
                        <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="w-full h-36 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                                    : <div className="flex flex-col items-center gap-1.5 text-gray-200"><Package className="w-10 h-10" /><span className="text-[10px] text-gray-300">No image</span></div>}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{p.sku}{p.category ? ` · ${p.category}` : ''}</p>
                                    </div>
                                    {user?.role === 'manager' && (
                                        <div className="flex gap-1 shrink-0">
                                            <button onClick={() => setModalProduct(p)} aria-label="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setStockProduct(p)} aria-label="Adjust stock" className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors"><ArrowDownToLine className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => setDeleteTarget(p)} aria-label="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-red-600">GH₵{Number(p.price).toFixed(2)}</span>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= p.low_stock_alert ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirmation */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="font-bold text-gray-900">Delete "{deleteTarget.name}"?</h3>
                        <p className="text-sm text-gray-500">This product will be removed from the catalogue. Stock movements are preserved.</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">Cancel</Button>
                            <Button variant="destructive" onClick={() => deleteProd.mutate(deleteTarget.id)} disabled={deleteProd.isPending} className="flex-1">
                                {deleteProd.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null} Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {modalProduct !== undefined && <ProductModal product={modalProduct} onClose={() => setModalProduct(undefined)} />}
            {stockProduct && <StockAdjustModal product={stockProduct} onClose={() => setStockProduct(null)} />}
        </div>
    );
}

// ─── Sales History Tab ─────────────────────────────────────────────────────────
function SalesTab() {
    const { data, isLoading } = useQuery({
        queryKey: ['pos-sales-today'],
        queryFn: async () => (await api.get('/pos/sales', { params: { date: new Date().toISOString().split('T')[0] } })).data,
        refetchInterval: 30_000,
    });
    const sales = data?.data ?? [];
    const todayTotal = sales.reduce((s: number, sale: any) => s + Number(sale.total), 0);

    return (
        <div className="space-y-4">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Today's Sales", value: sales.length, color: 'text-gray-900' },
                    { label: 'Total Revenue', value: `GH₵${todayTotal.toFixed(2)}`, color: 'text-red-600' },
                    { label: 'Items Sold', value: sales.reduce((s: number, sale: any) => s + (sale.items?.length ?? 0), 0), color: 'text-gray-900' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
                        <p className="text-[11px] text-gray-400 font-medium">{s.label}</p>
                        <p className={`text-[17px] font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {isLoading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
            ) : sales.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                    <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No sales today yet</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr>
                                    {['Receipt #', 'Customer', 'Items', 'Total', 'Change', 'Time'].map((h, i) => (
                                        <th key={h} className={`py-2.5 px-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 ${i === 0 ? 'pl-6' : ''} ${i === 5 ? 'pr-6' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sales.map((sale: any) => (
                                    <tr key={sale.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors">
                                        <td className="py-3 pl-6 pr-4 font-mono text-[12px] text-gray-700">{sale.receipt_number}</td>
                                        <td className="py-3 px-4 text-gray-600">{sale.customer_name || <span className="text-gray-300 italic">Walk-in</span>}</td>
                                        <td className="py-3 px-4 text-gray-500">{sale.items?.length ?? 0} item{sale.items?.length !== 1 ? 's' : ''}</td>
                                        <td className="py-3 px-4 font-semibold text-gray-900">GH₵{Number(sale.total).toFixed(2)}</td>
                                        <td className="py-3 px-4 text-emerald-600 font-medium">GH₵{Number(sale.change_given).toFixed(2)}</td>
                                        <td className="py-3 px-4 pr-6 text-[12px] text-gray-400">{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── POS Terminal Tab ──────────────────────────────────────────────────────────
function TerminalTab() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const searchRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [amountTendered, setAmountTendered] = useState('');
    const [discount, setDiscount] = useState('0');
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [error, setError] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Keyboard shortcut: press '/' to focus search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Warn before navigating away with items in cart
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => { if (cart.length > 0) { e.preventDefault(); e.returnValue = ''; } };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [cart.length]);

    const { data } = useQuery({
        queryKey: ['pos-products', search],
        queryFn: async () => (await api.get('/products', { params: { search, per_page: 60 } })).data,
    });

    const allProducts: Product[] = (data?.data ?? []).filter((p: Product) => p.stock > 0);

    // Derive categories from loaded products
    const categories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean))) as string[];

    // Apply category filter
    const products = activeCategory ? allProducts.filter(p => p.category === activeCategory) : allProducts;

    const addToCart = useCallback((product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) { toast('error', 'Stock limit', `Only ${product.stock} available`); return prev; }
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, [toast]);

    const setCartQty = (id: number, qty: number) => {
        if (qty < 1) { removeItem(id); return; }
        const product = cart.find(i => i.product.id === id)?.product;
        if (product && qty > product.stock) { toast('error', 'Stock limit', `Only ${product.stock} available`); return; }
        setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
    };

    const updateQty = (id: number, delta: number) => {
        const item = cart.find(i => i.product.id === id);
        if (item) setCartQty(id, item.quantity + delta);
    };

    const removeItem = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id));
    const clearCart = () => { setCart([]); setAmountTendered(''); setDiscount('0'); setCustomerName(''); setError(''); setShowClearConfirm(false); };

    const subtotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
    const discountAmt = Math.min(parseFloat(discount) || 0, subtotal);
    const discountCapped = discountAmt < (parseFloat(discount) || 0);
    const total = subtotal - discountAmt;
    const tendered = parseFloat(amountTendered) || 0;
    const change = tendered - total;
    const canCheckout = cart.length > 0 && tendered >= total && total > 0;

    const checkout = useMutation({
        mutationFn: () => api.post('/pos/checkout', {
            customer_name: customerName || null,
            items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
            amount_tendered: tendered,
            discount: discountAmt,
        }),
        onSuccess: (res) => {
            setLastSale(res.data); setShowReceipt(true); clearCart();
            queryClient.invalidateQueries({ queryKey: ['pos-products'] });
            queryClient.invalidateQueries({ queryKey: ['pos-sales-today'] });
        },
        onError: (e: any) => setError(e.response?.data?.message ?? 'Checkout failed'),
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: product grid */}
            <div className="lg:col-span-2 space-y-3">
                {/* Search — press '/' to focus */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                        ref={searchRef}
                        placeholder="Search products… (press / to focus)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 h-10 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/10 transition-all"
                    />
                </div>

                {/* Category filter pills */}
                {categories.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${!activeCategory ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            <Tag className="w-3 h-3" /> All
                        </button>
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${activeCategory === cat ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Product grid */}
                {products.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">{search || activeCategory ? 'No matching products' : 'No products available'}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {products.map(p => {
                            const inCart = cart.find(i => i.product.id === p.id);
                            const isLow = p.stock <= p.low_stock_alert;
                            return (
                                <button key={p.id} onClick={() => addToCart(p)}
                                    className={`relative rounded-xl border text-left transition-all active:scale-[0.97] hover:shadow-md bg-white overflow-hidden ${inCart ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <div className="w-full h-24 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
                                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-gray-200" />}
                                    </div>
                                    {inCart && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow">{inCart.quantity}</span>}
                                    {isLow && !inCart && <AlertTriangle className="absolute top-2 right-2 w-3.5 h-3.5 text-yellow-500" />}
                                    <div className="p-3">
                                        <p className="font-semibold text-sm text-gray-900 leading-tight">{p.name}</p>
                                        {p.category && <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>}
                                        <p className="text-sm font-bold text-red-600 mt-1.5">GH₵{Number(p.price).toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400">{p.stock} left</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right: cart */}
            <div>
                <Card className="border-gray-200 shadow-sm sticky top-24">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Cart
                            {cart.length > 0 && <span className="ml-auto text-xs bg-red-600 text-white rounded-full px-2 py-0.5">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Tap a product to add</p>
                                <p className="text-[11px] text-gray-300 mt-1">Press / to search</p>
                            </div>
                        ) : (
                            <>
                                {/* Cart items with thumbnail + direct qty input */}
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div key={item.product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                            {/* Thumbnail */}
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                {item.product.image_url
                                                    ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                                    : <Package className="w-4 h-4 text-gray-300" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">GH₵{Number(item.product.price).toFixed(2)} each</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                {/* Direct quantity input */}
                                                <input
                                                    type="number" min="1" max={item.product.stock}
                                                    value={item.quantity}
                                                    onChange={e => setCartQty(item.product.id, parseInt(e.target.value) || 1)}
                                                    className="w-9 text-center text-sm font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-1 ring-red-400 bg-white"
                                                />
                                                <button onClick={() => updateQty(item.product.id, 1)} disabled={item.quantity >= item.product.stock}
                                                    className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-40 transition-colors">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => removeItem(item.product.id)} className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1 transition-colors">
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm">
                                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>GH₵{subtotal.toFixed(2)}</span></div>
                                    <div className="flex items-center justify-between text-gray-500">
                                        <span>Discount</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs">GH₵</span>
                                            <input type="number" min="0" max={subtotal} step="0.01" value={discount}
                                                onChange={e => setDiscount(e.target.value)}
                                                className="w-16 text-xs text-right border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 ring-red-400" />
                                        </div>
                                    </div>
                                    {discountCapped && <p className="text-[10px] text-amber-600">Discount capped at GH₵{discountAmt.toFixed(2)}</p>}
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                                        <span>Total</span><span className="text-red-600">GH₵{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Customer + Cash */}
                                <div className="space-y-2 pt-1">
                                    <input placeholder="Customer name (optional)" value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="w-full h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-red-400 bg-white placeholder:text-gray-400" />
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">GH₵</span>
                                        <input type="number" step="0.01" placeholder="Cash received"
                                            value={amountTendered} onChange={e => setAmountTendered(e.target.value)}
                                            className="w-full h-9 pl-10 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 ring-red-400 bg-white placeholder:text-gray-400" />
                                    </div>
                                    {tendered > 0 && tendered >= total && (
                                        <div className="flex justify-between text-sm font-bold bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-100">
                                            <span>Change</span><span>GH₵{change.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {tendered > 0 && tendered < total && (
                                        <p className="text-xs text-red-500 text-center">Short by GH₵{(total - tendered).toFixed(2)}</p>
                                    )}
                                </div>

                                {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setShowClearConfirm(true)} className="flex-1 text-gray-500">Clear</Button>
                                    <Button onClick={() => checkout.mutate()} disabled={!canCheckout || checkout.isPending} className="flex-1">
                                        {checkout.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <DollarSign className="w-4 h-4 mr-1" />}
                                        Charge
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Clear cart confirmation */}
            {showClearConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 space-y-4">
                        <h3 className="font-bold text-gray-900">Clear cart?</h3>
                        <p className="text-sm text-gray-500">{cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} will be removed.</p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="flex-1">Cancel</Button>
                            <Button variant="destructive" onClick={clearCart} className="flex-1">Clear</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt modal */}
            {showReceipt && lastSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 print:hidden">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-gray-900">Sale Complete</h3>
                            </div>
                            <button onClick={() => setShowReceipt(false)} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close"><X className="w-4 h-4 text-gray-500" /></button>
                        </div>
                        <div id="thermal-receipt" className="p-5 space-y-3 font-mono text-sm">
                            <div className="text-center font-bold text-base">PerfectService POS</div>
                            <div className="text-center text-xs text-gray-500">{new Date().toLocaleString()}</div>
                            <div className="text-center text-xs font-mono text-gray-600">{lastSale.receipt_number}</div>
                            <div className="border-t border-dashed border-gray-300 my-2" />
                            {lastSale.customer_name && <div className="text-xs text-gray-600">Customer: {lastSale.customer_name}</div>}
                            <div className="space-y-1">
                                {lastSale.items?.map((item: any) => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                        <span className="flex-1 truncate pr-2">{item.product_name}</span>
                                        <span className="shrink-0 text-gray-500 mr-2">x{item.quantity}</span>
                                        <span className="shrink-0 font-semibold">GH₵{Number(item.line_total).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2" />
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>GH₵{Number(lastSale.subtotal ?? lastSale.total).toFixed(2)}</span></div>
                                {Number(lastSale.discount) > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-GH₵{Number(lastSale.discount).toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-200"><span>TOTAL</span><span>GH₵{Number(lastSale.total).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Cash</span><span>GH₵{Number(lastSale.amount_tendered).toFixed(2)}</span></div>
                                <div className="flex justify-between font-semibold text-green-700"><span>Change</span><span>GH₵{Number(lastSale.change_given).toFixed(2)}</span></div>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2" />
                            <div className="text-center text-xs text-gray-400">Thank you for your business!</div>
                        </div>
                        <div className="flex gap-2 p-4 pt-0 print:hidden">
                            <Button variant="outline" onClick={() => window.print()} className="flex-1"><Printer className="w-4 h-4 mr-2" /> Print Receipt</Button>
                            <Button onClick={() => setShowReceipt(false)} className="flex-1">New Sale</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function POSPage() {
    const [tab, setTab] = useState<'terminal' | 'products' | 'sales'>('terminal');

    const tabs = [
        { id: 'terminal' as const, label: 'Terminal', icon: ShoppingCart },
        { id: 'products' as const, label: 'Products', icon: Package },
        { id: 'sales' as const, label: "Today's Sales", icon: Receipt },
    ];

    return (
        <DashboardLayout>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-5">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        <t.icon className="w-4 h-4" />{t.label}
                    </button>
                ))}
            </div>
            {tab === 'terminal' && <TerminalTab />}
            {tab === 'products' && <ProductsTab />}
            {tab === 'sales' && <SalesTab />}
        </DashboardLayout>
    );
}
