<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServicePricing extends Model
{
    protected $fillable = [
        'service_id',
        'vehicle_type_id',
        'min_price',
        'max_price',
        'fixed_price',
        'is_fixed',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function vehicleType()
    {
        return $this->belongsTo(VehicleType::class);
    }
}
