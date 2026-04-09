<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'barcode', 'category',
        'price', 'cost_price', 'stock', 'low_stock_alert',
        'description', 'image_path', 'is_active', 'created_by',
    ];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'price'      => 'decimal:2',
            'cost_price' => 'decimal:2',
            'stock'      => 'integer',
            'is_active'  => 'boolean',
        ];
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : null;
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(PosSaleItem::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Record a stock movement and update the stock count atomically.
     */
    public function recordMovement(
        string $type,
        int $quantity,
        ?string $reference = null,
        ?string $notes = null
    ): StockMovement {
        $before = $this->stock;
        $after  = $before + $quantity;

        $this->update(['stock' => $after]);

        return $this->stockMovements()->create([
            'created_by'   => Auth::id(),
            'type'         => $type,
            'quantity'     => $quantity,
            'stock_before' => $before,
            'stock_after'  => $after,
            'reference'    => $reference,
            'notes'        => $notes,
        ]);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->low_stock_alert;
    }

    public static function generateSku(): string
    {
        return 'SKU-' . strtoupper(substr(uniqid(), -6));
    }
}
