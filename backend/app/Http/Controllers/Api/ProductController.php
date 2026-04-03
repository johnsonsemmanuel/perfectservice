<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\AuditLog;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function __construct(private AuditService $auditService) {}
    public function index(Request $request)
    {
        $query = Product::where('is_active', true);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%")
                  ->orWhere('barcode', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->orderBy('name')->paginate($request->per_page ?? 60)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:255',
            'sku'              => 'nullable|string|unique:products,sku',
            'barcode'          => 'nullable|string|unique:products,barcode',
            'category'         => 'nullable|string|max:100',
            'price'            => 'required|numeric|min:0',
            'cost_price'       => 'nullable|numeric|min:0',
            'stock'            => 'required|integer|min:0',
            'low_stock_alert'  => 'nullable|integer|min:0',
            'description'      => 'nullable|string',
            'image'            => 'nullable|image|mimes:jpeg,png,webp|max:2048',
        ]);

        $data['created_by'] = Auth::id();
        if (empty($data['sku'])) {
            $data['sku'] = Product::generateSku();
        }

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('products', 'public');
        }

        unset($data['image']);
        return response()->json(Product::create($data), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'sku'             => "sometimes|string|unique:products,sku,{$product->id}",
            'barcode'         => "sometimes|nullable|string|unique:products,barcode,{$product->id}",
            'category'        => 'sometimes|nullable|string|max:100',
            'price'           => 'sometimes|numeric|min:0',
            'cost_price'      => 'sometimes|nullable|numeric|min:0',
            'stock'           => 'sometimes|integer|min:0',
            'low_stock_alert' => 'sometimes|integer|min:0',
            'description'     => 'sometimes|nullable|string',
            'is_active'       => 'sometimes|boolean',
            'image'           => 'nullable|image|mimes:jpeg,png,webp|max:2048',
            'remove_image'    => 'sometimes|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = $request->file('image')->store('products', 'public');
        } elseif (!empty($data['remove_image'])) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $data['image_path'] = null;
        }

        unset($data['image'], $data['remove_image']);
        $product->update($data);
        return response()->json($product->fresh());
    }

    public function destroy(Product $product)
    {
        $this->auditService->log(
            AuditLog::ACTION_DELETE,
            'product',
            $product->id,
            ['name' => $product->name, 'sku' => $product->sku, 'stock' => $product->stock],
            null,
            'Product deleted',
            'warning'
        );
        $product->delete();
        return response()->json(['message' => 'Product deleted.']);
    }

    public function categories()
    {
        $cats = Product::whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();
        return response()->json($cats);
    }
}
