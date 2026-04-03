<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

/**
 * SECURITY: Central audit logging service.
 * All tracked actions MUST go through this service.
 * Audit logs are immutable — no update or delete operations.
 */
class AuditService
{
    /**
     * Log an auditable action.
     */
    public function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        mixed $oldValue = null,
        mixed $newValue = null,
        ?string $reason = null,
        string $severity = 'info'
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'old_value' => is_array($oldValue) ? $oldValue : ($oldValue !== null ? ['value' => $oldValue] : null),
            'new_value' => is_array($newValue) ? $newValue : ($newValue !== null ? ['value' => $newValue] : null),
            'reason' => $reason,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'severity' => $severity,
        ]);
    }

    /**
     * Log a pricing violation attempt.
     */
    public function logPricingViolation(string $entityType, ?int $entityId, array $details): AuditLog
    {
        return $this->log(
            AuditLog::ACTION_PRICING_VIOLATION,
            $entityType,
            $entityId,
            $details,
            null,
            'Price outside allowed range',
            'warning'
        );
    }

    /**
     * Log an unauthorized access attempt.
     */
    public function logUnauthorizedAttempt(string $action, string $entityType, ?int $entityId = null): AuditLog
    {
        return $this->log(
            AuditLog::ACTION_UNAUTHORIZED_ATTEMPT,
            $entityType,
            $entityId,
            ['attempted_action' => $action],
            null,
            'Unauthorized access attempt',
            'critical'
        );
    }
}
