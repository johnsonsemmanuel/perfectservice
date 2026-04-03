<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    public function isLowStock(): bool
    {
        return $this->stock <= $this->low_stock_alert;
    }

    public static function generateSku(): string
    {
        return 'SKU-' . strtoupper(substr(uniqid(), -6));
    }
}
