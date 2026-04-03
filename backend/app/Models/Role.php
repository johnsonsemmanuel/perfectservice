<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'permissions',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // ─── Constants ─────────────────────────────────────────────

    public const CASH_OFFICER = 'cash_officer';
    public const SERVICE_ADVISOR = 'service_advisor';
    public const MANAGER = 'manager';
    public const TECHNICIAN = 'technician';
}
