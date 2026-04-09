<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerVehicle extends Model
{
    protected $fillable = [
        'customer_id', 'registration', 'make', 'model',
        'year', 'color', 'vin', 'notes',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function jobCards(): HasMany
    {
        return $this->hasMany(JobCard::class, 'vehicle_number', 'registration');
    }
}
