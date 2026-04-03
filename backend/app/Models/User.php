<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'pin',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'pin',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'pin' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function jobCards(): HasMany
    {
        return $this->hasMany(JobCard::class, 'created_by');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    // ─── Role Helpers ──────────────────────────────────────────

    public function isManager(): bool
    {
        return $this->role?->name === 'manager';
    }

    public function isCashOfficer(): bool
    {
        return $this->role?->name === 'cash_officer';
    }

    public function isServiceAdvisor(): bool
    {
        return $this->role?->name === 'service_advisor';
    }

    public function isTechnician(): bool
    {
        return $this->role?->name === 'technician';
    }

    public function hasPermission(string $permission): bool
    {
        $permissions = $this->role?->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Verify the manager's PIN for override operations.
     * SECURITY: Uses bcrypt comparison, never plaintext.
     */
    public function verifyPin(string $pin): bool
    {
        if (!$this->pin) {
            return false;
        }
        return \Illuminate\Support\Facades\Hash::check($pin, $this->pin);
    }
}
