<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PosSale extends Model
{
    protected $fillable = [
        'receipt_number', 'customer_name',
        'subtotal', 'discount', 'total',
        'amount_tendered', 'change_given',
        'payment_method', 'status', 'notes', 'served_by',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'        => 'decimal:2',
            'discount'        => 'decimal:2',
            'total'           => 'decimal:2',
            'amount_tendered' => 'decimal:2',
            'change_given'    => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PosSaleItem::class);
    }

    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public static function generateReceiptNumber(): string
    {
        $prefix = 'RCP-' . now()->format('Ymd') . '-';
        $last = static::where('receipt_number', 'like', $prefix . '%')
            ->orderByDesc('receipt_number')->first();
        $next = $last ? ((int) substr($last->receipt_number, -4)) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }
}
