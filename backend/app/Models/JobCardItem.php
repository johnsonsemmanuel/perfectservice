<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobCardItem extends Model
{
    protected $fillable = [
        'job_card_id',
        'service_id',
        'agreed_price',
        'quantity',
        'line_total',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'agreed_price' => 'decimal:2',
            'quantity' => 'integer',
            'line_total' => 'decimal:2',
        ];
    }

    public function jobCard(): BelongsTo
    {
        return $this->belongsTo(JobCard::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    // ─── Mutators ──────────────────────────────────────────────

    protected static function booted(): void
    {
        // Auto-calculate line_total on create/update
        static::saving(function (JobCardItem $item) {
            $item->line_total = $item->agreed_price * $item->quantity;
        });
    }
}
