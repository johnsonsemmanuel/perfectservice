<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'is_locked',
        'group',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
        ];
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeLocked(Builder $query): Builder
    {
        return $query->where('is_locked', true);
    }

    public function scopeEditable(Builder $query): Builder
    {
        return $query->where('is_locked', false);
    }

    public function scopeByGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }

    // ─── Static Helpers ────────────────────────────────────────

    /**
     * Get a setting value by key. Returns typed value based on the 'type' column.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return match ($setting->type) {
            'boolean' => (bool) $setting->value,
            'integer' => (int) $setting->value,
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    /**
     * Set a setting value. SECURITY: Rejects changes to locked settings.
     * @throws \RuntimeException if the setting is locked
     */
    public static function setValue(string $key, mixed $value): void
    {
        $setting = static::where('key', $key)->first();

        if ($setting && $setting->is_locked) {
            throw new \RuntimeException("Setting '{$key}' is locked and cannot be modified.");
        }

        if ($setting) {
            $setting->update(['value' => is_array($value) ? json_encode($value) : (string) $value]);
        } else {
            static::create([
                'key' => $key,
                'value' => is_array($value) ? json_encode($value) : (string) $value,
            ]);
        }
    }
}
