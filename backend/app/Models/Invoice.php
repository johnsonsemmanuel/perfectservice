<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'job_card_id',
        'subtotal',
        'discount_percent',
        'discount_amount',
        'tax_percent',
        'tax_amount',
        'total',
        'amount_paid',
        'balance_due',
        'status',
        'created_by',
        'voided_by',
        'void_reason',
        'voided_at',
        'issued_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_percent' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'balance_due' => 'decimal:2',
            'voided_at' => 'datetime',
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────

    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function voidedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->whereIn('status', ['issued', 'partial']);
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', 'paid');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', '!=', 'void');
    }

    // ─── Helpers ───────────────────────────────────────────────

    public static function generateInvoiceNumber(): string
    {
        $prefix = 'INV-' . now()->format('Ym') . '-';
        $lastInvoice = static::withTrashed()->where('invoice_number', 'like', $prefix . '%')
            ->orderByDesc('invoice_number')
            ->first();

        if ($lastInvoice) {
            $lastNum = (int) substr($lastInvoice->invoice_number, -4);
            $nextNum = $lastNum + 1;
        } else {
            $nextNum = 1;
        }

        return $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
    }

    public function isFullyPaid(): bool
    {
        return (float) $this->balance_due <= 0;
    }

    public function canAcceptPayment(): bool
    {
        return in_array($this->status, ['issued', 'partial']);
    }

    public function isVoided(): bool
    {
        return $this->status === 'void';
    }

    /**
     * Recalculate totals from items. Must be called within a transaction.
     */
    public function recalculateTotals(): void
    {
        $subtotal = $this->items->sum('line_total');
        $discountAmount = $subtotal * ($this->discount_percent / 100);
        $afterDiscount = $subtotal - $discountAmount;
        $taxAmount = $afterDiscount * ($this->tax_percent / 100);
        $total = $afterDiscount + $taxAmount;

        $this->update([
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'balance_due' => $total - $this->amount_paid,
        ]);
    }
}
