<?php

namespace Database\Seeders;

use App\Models\VehicleType;
use Illuminate\Database\Seeder;

class VehicleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Saloon', 'slug' => 'saloon'],
            ['name' => 'SUV / Crossover', 'slug' => 'suv'],
            ['name' => 'Pickup / 4x4', 'slug' => 'pickup'],
            ['name' => 'Truck / Van', 'slug' => 'truck'],
        ];

        foreach ($types as $type) {
            VehicleType::updateOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }
    }
}
