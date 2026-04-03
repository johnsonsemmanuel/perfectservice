<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_id',
        'amount',
        'method',
        'reference',
        'momo_phone',
        'received_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeCash(Builder $query): Builder
    {
        return $query->where('method', 'cash');
    }

    public function scopeMomo(Builder $query): Builder
    {
        return $query->where('method', 'momo');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', today());
    }
}
