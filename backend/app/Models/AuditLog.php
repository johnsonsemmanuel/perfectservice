<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class AuditLog extends Model
{
    // SECURITY: No soft deletes — audit logs are immutable permanent records

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_value',
        'new_value',
        'reason',
        'ip_address',
        'user_agent',
        'severity',
    ];

    protected function casts(): array
    {
        return [
            'old_value' => 'array',
            'new_value' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeForEntity(Builder $query, string $type, int $id): Builder
    {
        return $query->where('entity_type', $type)->where('entity_id', $id);
    }

    public function scopeByAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    public function scopeCritical(Builder $query): Builder
    {
        return $query->where('severity', 'critical');
    }

    public function scopeToday(Builder $query): Builder
    {
        return $query->whereDate('created_at', today());
    }

    // ─── Action Constants ──────────────────────────────────────

    public const ACTION_PRICE_OVERRIDE = 'price_override';
    public const ACTION_DISCOUNT_APPLIED = 'discount_applied';
    public const ACTION_INVOICE_VOIDED = 'invoice_voided';
    public const ACTION_INVOICE_CREATED = 'invoice_created';
    public const ACTION_PAYMENT_RECEIVED = 'payment_received';
    public const ACTION_JOB_CARD_CREATED = 'job_card_created';
    public const ACTION_JOB_CARD_STATUS = 'job_card_status_changed';
    public const ACTION_PRICING_VIOLATION = 'pricing_violation';
    public const ACTION_UNAUTHORIZED_ATTEMPT = 'unauthorized_attempt';
    public const ACTION_DAILY_CLOSING = 'daily_closing';
    public const ACTION_DISCOUNT_REJECTED = 'discount_rejected';
    public const ACTION_LOGIN = 'user_login';
    public const ACTION_LOGOUT = 'user_logout';
}
