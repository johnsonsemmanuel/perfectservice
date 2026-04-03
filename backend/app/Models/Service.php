<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use App\Models\ServicePricing;

class Service extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'min_price',
        'max_price',
        'fixed_price',
        'is_fixed',
        'is_active',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'min_price' => 'decimal:2',
            'max_price' => 'decimal:2',
            'fixed_price' => 'decimal:2',
            'is_fixed' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────

    public function jobCardItems(): HasMany
    {
        return $this->hasMany(JobCardItem::class);
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function pricing(): HasMany
    {
        return $this->hasMany(ServicePricing::class);
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    // ─── Pricing Helpers ───────────────────────────────────────

    /**
     * Check if a given price is within the allowed range.
     * SECURITY: This is a convenience method. Authoritative validation
     * happens in PricingValidationService on the server side.
     */
    public function isPriceValid(float $price): bool
    {
        if ($this->is_fixed) {
            return abs($price - (float) $this->fixed_price) < 0.01;
        }

        return $price >= (float) $this->min_price && $price <= (float) $this->max_price;
    }
}
