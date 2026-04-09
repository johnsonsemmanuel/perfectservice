<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'notes',
    ];

    public function jobCards(): HasMany
    {
        return $this->hasMany(JobCard::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(CustomerVehicle::class);
    }
}
