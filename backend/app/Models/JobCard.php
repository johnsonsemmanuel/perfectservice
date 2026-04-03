<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class JobCard extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'job_number',
        'customer_id', // Added
        'vehicle_number',
        'vehicle_make',
        'vehicle_model',
        'vehicle_type_id',
        'vehicle_year',
        'vehicle_color',
        'mileage',
        'customer_name',
        'customer_phone',
        'customer_email',
        'technician',
        'status',
        'notes',
        'diagnosis',
        'created_by',
        'approved_by',
        'approved_at',
        'manager_feedback', // Added
    ];

    protected function casts(): array
    {
        return [
            'mileage' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(JobCardItem::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopeInvoiceable(Builder $query): Builder
    {
        return $query->whereIn('status', ['completed'])
            ->whereDoesntHave('invoice');
    }

    // ─── Helpers ───────────────────────────────────────────────

    /**
     * Generate the next sequential job number.
     */
    public static function generateJobNumber(): string
    {
        $prefix = 'JC-' . now()->format('Ym') . '-';
        $lastJob = static::withTrashed()->where('job_number', 'like', $prefix . '%')
            ->orderByDesc('job_number')
            ->first();

        if ($lastJob) {
            $lastNum = (int) substr($lastJob->job_number, -4);
            $nextNum = $lastNum + 1;
        } else {
            $nextNum = 1;
        }

        return $prefix . str_pad($nextNum, 4, '0', STR_PAD_LEFT);
    }

    public function getTotal(): float
    {
        return $this->items->sum('line_total');
    }

    public function isInvoiced(): bool
    {
        return $this->status === 'invoiced';
    }

    public function canBeInvoiced(): bool
    {
        return $this->status === 'completed' && !$this->invoice;
    }
}
