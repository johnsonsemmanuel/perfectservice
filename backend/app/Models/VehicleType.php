<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleType extends Model
{
    protected $fillable = ['name', 'slug'];

    public function servicePricings()
    {
        return $this->hasMany(ServicePricing::class);
    }

    public function vehicleModels()
    {
        return $this->hasMany(VehicleModel::class);
    }
}
