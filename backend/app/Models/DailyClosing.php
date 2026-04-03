<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class DailyClosing extends Model
{
    protected $fillable = [
        'closing_date',
        'cash_total',
        'momo_total',
        'expected_total',
        'actual_cash',
        'actual_momo',
        'discrepancy',
        'total_invoices',
        'total_job_cards',
        'service_breakdown',
        'status',
        'notes',
        'flag_reason',
        'closed_by',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'closing_date' => 'date',
            'cash_total' => 'decimal:2',
            'momo_total' => 'decimal:2',
            'expected_total' => 'decimal:2',
            'actual_cash' => 'decimal:2',
            'actual_momo' => 'decimal:2',
            'discrepancy' => 'decimal:2',
            'total_invoices' => 'integer',
            'total_job_cards' => 'integer',
            'service_breakdown' => 'array',
            'closed_at' => 'datetime',
        ];
    }

    public function closedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeFlagged(Builder $query): Builder
    {
        return $query->where('status', 'flagged');
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }

    public function hasDiscrepancy(): bool
    {
        return abs((float) $this->discrepancy) > 0.01;
    }
}
