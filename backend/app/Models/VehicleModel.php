<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $fillable = ['vehicle_make_id', 'vehicle_type_id', 'name', 'slug'];

    public function make()
    {
        return $this->belongsTo(VehicleMake::class, 'vehicle_make_id');
    }

    public function type()
    {
        return $this->belongsTo(VehicleType::class);
    }
}
