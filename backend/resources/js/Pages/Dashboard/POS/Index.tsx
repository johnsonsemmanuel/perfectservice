import { useState, useEffect } from 'react';
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
    ShoppingCart, Plus, Minus, Trash2, Receipt, Loader2, X,
    CheckCircle, Search, Package, Tag, AlertTriangle, Edit2,
    BarChart3, DollarSign, Printer,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    sku: string;
    category: string | null;
    price: number;
    stock: number;
    low_stock_alert: number;
    description: string | null;
}

interface CartItem { product: Product; quantity: number; }

// ─── Product Form Modal ────────────────────────────────────────────────────────
function ProductModal({ product, onClose }: { product?: Product | null; onClose: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const isEdit = !!product;

    const [form, setForm] = useState({
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        category: product?.category ?? '',
        price: product?.price?.toString() ?? '',
        stock: product?.stock?.toString() ?? '0',
        low_stock_alert: product?.low_stock_alert?.toString() ?? '5',
        description: product?.description ?? '',
    });

    const save = useMutation({
        mutationFn: () => isEdit
            ? api.put(`/products/${product!.id}`, { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), low_stock_alert: parseInt(form.low_stock_alert) })
            : api.post('/products', { ...form, price: parseFloat(form.price), stock: parseInt(form.stock), low_stock_alert: parseInt(form.low_stock_alert) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-products'] });
            toast('success', isEdit ? 'Product updated' : 'Product added');
            onClose();
        },
        onError: (e: any) => toast('error', 'Failed', e.response?.data?.message ?? 'Try again'),
    });

    const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-600" />
                        {isEdit ? 'Edit Product' : 'Add Product'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="space-y-1">
                        <Label>Product Name *</Label>
                        <Input value={form.name} onChange={f('name')} placeholder="e.g. Engine Oil 5W-30" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>SKU</Label>
                            <Input value={form.sku} onChange={f('sku')} placeholder="Auto-generated" />
                        </div>
                        <div className="space-y-1">
                            <Label>Category</Label>
                            <Input value={form.category} onChange={f('category')} placeholder="e.g. Lubricants" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label>Price (GH₵) *</Label>
                            <Input type="number" min="0" step="0.01" value={form.price} onChange={f('price')} placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <Label>Stock Qty *</Label>
                            <Input type="number" min="0" value={form.stock} onChange={f('stock')} placeholder="0" />
                        </div>
                        <div className="space-y-1">
                            <Label>Low Alert</Label>
                            <Input type="number" min="0" value={form.low_stock_alert} onChange={f('low_stock_alert')} placeholder="5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Description</Label>
                        <textarea value={form.description} onChange={f('description')} placeholder="Optional notes..."
                            className="w-full h-16 px-3 py-2 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 ring-red-400 bg-gray-50" />
                    </div>
                </div>
                <div className="flex gap-3 p-5 pt-0">
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.price} className="flex-1">
                        {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isEdit ? 'Save Changes' : 'Add Product'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Products Management Tab (Manager only) ────────────────────────────────────
function ProductsTab() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [modalProduct, setModalProduct] = useState<Product | null | undefined>(undefined); // undefined = closed

    const { data, isLoading } = useQuery({
        queryKey: ['pos-products', search],
        queryFn: async () => {
            const res = await api.get('/products', { params: { search, per_page: 100 } });
            return res.data;
        },
    });

    const products: Product[] = data?.data ?? [];

    const deleteProd = useMutation({
        mutationFn: (id: number) => api.delete(`/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-products'] });
            toast('success', 'Product removed');
        },
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
                    <Button onClick={() => setModalProduct(null)} className="shrink-0">
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)}
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
                        <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{p.sku} {p.category ? `· ${p.category}` : ''}</p>
                                </div>
                                {user?.role === 'manager' && (
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => setModalProduct(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => confirm('Delete this product?') && deleteProd.mutate(p.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-3">
                                <span className="text-lg font-bold text-red-600">GH₵{Number(p.price).toFixed(2)}</span>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    p.stock === 0 ? 'bg-red-100 text-red-700' :
                                    p.stock <= p.low_stock_alert ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modalProduct !== undefined && (
                <ProductModal product={modalProduct} onClose={() => setModalProduct(undefined)} />
            )}
        </div>
    );
}

// ─── POS Terminal Tab ──────────────────────────────────────────────────────────
function TerminalTab() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [amountTendered, setAmountTendered] = useState('');
    const [discount, setDiscount] = useState('0');
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState<any>(null);
    const [error, setError] = useState('');

    // Warn before navigating away with items in cart
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (cart.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [cart.length]);

    const { data } = useQuery({
        queryKey: ['pos-products', search],
        queryFn: async () => {
            const res = await api.get('/products', { params: { search, per_page: 60 } });
            return res.data;
        },
    });

    const products: Product[] = (data?.data ?? []).filter((p: Product) => p.stock > 0);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast('error', 'Stock limit', `Only ${product.stock} available`);
                    return prev;
                }
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
    };

    const removeItem = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id));
    const clearCart = () => { setCart([]); setAmountTendered(''); setDiscount('0'); setCustomerName(''); setError(''); };
    const confirmClearCart = () => {
        if (cart.length > 0 && !confirm('Clear all items from cart?')) return;
        clearCart();
    };

    const subtotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0);
    const discountAmt = Math.min(parseFloat(discount) || 0, subtotal);
    const total = subtotal - discountAmt;
    const tendered = parseFloat(amountTendered) || 0;
    const change = tendered - total;

    const checkout = useMutation({
        mutationFn: () => api.post('/pos/checkout', {
            customer_name: customerName || null,
            items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
            amount_tendered: tendered,
            discount: discountAmt,
        }),
        onSuccess: (res) => {
            setLastSale(res.data);
            setShowReceipt(true);
            clearCart();
            queryClient.invalidateQueries({ queryKey: ['pos-products'] });
        },
        onError: (e: any) => setError(e.response?.data?.message ?? 'Checkout failed'),
    });

    const canCheckout = cart.length > 0 && tendered >= total && total > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product grid */}
            <div className="lg:col-span-2 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search products by name or category..." value={search}
                        onChange={e => setSearch(e.target.value)} className="pl-10" />
                </div>
                {products.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No products available</p>
                        <p className="text-xs mt-1 text-gray-300">Ask a manager to add products</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {products.map(p => {
                            const inCart = cart.find(i => i.product.id === p.id);
                            const isLow = p.stock <= p.low_stock_alert;
                            return (
                                <button key={p.id} onClick={() => addToCart(p)}
                                    className={`relative p-4 rounded-xl border text-left transition-all active:scale-95 hover:shadow-md bg-white ${
                                        inCart ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-100 hover:border-gray-200'
                                    }`}>
                                    {inCart && (
                                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                                            {inCart.quantity}
                                        </span>
                                    )}
                                    {isLow && !inCart && (
                                        <AlertTriangle className="absolute top-2 right-2 w-3.5 h-3.5 text-yellow-500" />
                                    )}
                                    <p className="font-semibold text-sm text-gray-900 leading-tight pr-6">{p.name}</p>
                                    {p.category && <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>}
                                    <p className="text-base font-bold text-red-600 mt-2">GH₵{Number(p.price).toFixed(2)}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{p.stock} left</p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Cart */}
            <div>
                <Card className="border-0 shadow-sm sticky top-24">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Cart
                            {cart.length > 0 && (
                                <span className="ml-auto text-xs bg-red-600 text-white rounded-full px-2 py-0.5">
                                    {cart.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Tap a product to add</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {cart.map(item => (
                                        <div key={item.product.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold truncate">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">GH₵{Number(item.product.price).toFixed(2)} each</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                                                <button onClick={() => updateQty(item.product.id, 1)} disabled={item.quantity >= item.product.stock}
                                                    className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center hover:bg-gray-300 disabled:opacity-40">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => removeItem(item.product.id)} className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1">
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-sm">
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span><span>GH₵{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-500">
                                        <span>Discount</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs">GH₵</span>
                                            <input type="number" min="0" max={subtotal} step="0.01" value={discount}
                                                onChange={e => setDiscount(e.target.value)}
                                                className="w-16 text-xs text-right border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 ring-red-400" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                                        <span>Total</span>
                                        <span className="text-red-600">GH₵{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Customer + Cash */}
                                <div className="space-y-2 pt-1">
                                    <Input placeholder="Customer name (optional)" value={customerName}
                                        onChange={e => setCustomerName(e.target.value)} className="h-9 text-sm" />
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono">GH₵</span>
                                        <Input type="number" min={total} step="0.01" placeholder="Cash received"
                                            value={amountTendered} onChange={e => setAmountTendered(e.target.value)}
                                            className="h-9 text-sm pl-10" />
                                    </div>
                                    {tendered > 0 && tendered >= total && (
                                        <div className="flex justify-between text-sm font-bold bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-100">
                                            <span>Change</span>
                                            <span>GH₵{change.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {tendered > 0 && tendered < total && (
                                        <p className="text-xs text-red-500 text-center">
                                            Short by GH₵{(total - tendered).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={confirmClearCart} className="flex-1 text-gray-500">Clear</Button>
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

            {/* Receipt modal */}
            {showReceipt && lastSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <h3 className="font-bold text-gray-900">Sale Complete!</h3>
                            </div>
                            <button onClick={() => setShowReceipt(false)} className="p-1 rounded-lg hover:bg-gray-100">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                            <p className="text-2xl font-bold text-green-700">GH₵{Number(lastSale.total).toFixed(2)}</p>
                            <p className="text-sm text-green-600 mt-1">{lastSale.receipt_number}</p>
                        </div>
                        <div className="space-y-2 text-sm">
                            {lastSale.customer_name && (
                                <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-medium">{lastSale.customer_name}</span></div>
                            )}
                            <div className="flex justify-between"><span className="text-gray-500">Cash received</span><span className="font-medium">GH₵{Number(lastSale.amount_tendered).toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-green-700"><span>Change</span><span>GH₵{Number(lastSale.change_given).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-medium">{lastSale.items?.length} line(s)</span></div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => window.print()} className="flex-1">
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </Button>
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
    const { user } = useAuth();
    const [tab, setTab] = useState<'terminal' | 'products' | 'sales'>('terminal');

    const tabs = [
        { id: 'terminal', label: 'Terminal', icon: ShoppingCart },
        { id: 'products', label: 'Products', icon: Package },
    ] as const;

    return (
        <DashboardLayout>
            {/* Tab bar */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'terminal' && <TerminalTab />}
            {tab === 'products' && <ProductsTab />}
        </DashboardLayout>
    );
}
