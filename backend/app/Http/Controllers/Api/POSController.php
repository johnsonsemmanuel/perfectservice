<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PosSale;
use App\Models\PosSaleItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class POSController extends Controller
{
    /**
     * Process a retail sale — deducts stock, records sale + items.
     */
    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'customer_name'          => 'nullable|string|max:255',
            'items'                  => 'required|array|min:1',
            'items.*.product_id'     => 'required|integer|exists:products,id',
            'items.*.quantity'       => 'required|integer|min:1',
            'amount_tendered'        => 'required|numeric|min:0',
            'discount'               => 'nullable|numeric|min:0',
            'notes'                  => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $lineItems = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw new \InvalidArgumentException(
                        "Insufficient stock for \"{$product->name}\". Available: {$product->stock}"
                    );
                }

                $lineTotal = $product->price * $item['quantity'];
                $subtotal += $lineTotal;

                $lineItems[] = [
                    'product'      => $product,
                    'quantity'     => $item['quantity'],
                    'unit_price'   => $product->price,
                    'line_total'   => $lineTotal,
                ];
            }

            $discount = (float) ($validated['discount'] ?? 0);
            $total    = max(0, $subtotal - $discount);
            $tendered = (float) $validated['amount_tendered'];

            if ($tendered < $total) {
                throw new \InvalidArgumentException(
                    "Amount tendered (GH₵{$tendered}) is less than total (GH₵{$total})."
                );
            }

            // Create sale record
            $sale = PosSale::create([
                'receipt_number'  => PosSale::generateReceiptNumber(),
                'customer_name'   => $validated['customer_name'] ?? null,
                'subtotal'        => $subtotal,
                'discount'        => $discount,
                'total'           => $total,
                'amount_tendered' => $tendered,
                'change_given'    => $tendered - $total,
                'payment_method'  => 'cash',
                'notes'           => $validated['notes'] ?? null,
                'served_by'       => Auth::id(),
            ]);

            // Create items + deduct stock + record movement
            foreach ($lineItems as $line) {
                PosSaleItem::create([
                    'pos_sale_id'  => $sale->id,
                    'product_id'   => $line['product']->id,
                    'product_name' => $line['product']->name,
                    'unit_price'   => $line['unit_price'],
                    'quantity'     => $line['quantity'],
                    'line_total'   => $line['line_total'],
                ]);

                // Record stock movement (negative = sold)
                $line['product']->recordMovement(
                    'sale',
                    -$line['quantity'],
                    $sale->receipt_number,
                    "POS sale"
                );
            }

            return response()->json($sale->load('items', 'servedBy'), 201);
        });
    }

    /**
     * Sales history with totals.
     */
    public function sales(Request $request)
    {
        $sales = PosSale::with('items', 'servedBy')
            ->when($request->date, fn($q) => $q->whereDate('created_at', $request->date))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($sales);
    }

    /**
     * Today's POS summary for dashboard.
     */
    public function todaySummary()
    {
        $today = now()->toDateString();
        $sales = PosSale::whereDate('created_at', $today);

        return response()->json([
            'total_sales'    => $sales->sum('total'),
            'transaction_count' => $sales->count(),
            'items_sold'     => PosSaleItem::whereHas('sale', fn($q) => $q->whereDate('created_at', $today))->sum('quantity'),
        ]);
    }
}
