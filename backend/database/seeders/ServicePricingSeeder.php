<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\VehicleType;
use App\Models\ServicePricing;
use Illuminate\Database\Seeder;

class ServicePricingSeeder extends Seeder
{
    public function run(): void
    {
        $services = Service::all();
        $vehicleTypes = VehicleType::all();

        $multipliers = [
            'saloon' => 1.0,
            'suv' => 1.25,      // 25% Markup
            'pickup' => 1.35,   // 35% Markup
            'truck' => 1.50,    // 50% Markup
        ];

        foreach ($services as $service) {
            foreach ($vehicleTypes as $type) {
                $multiplier = $multipliers[$type->slug] ?? 1.0;

                // Skip if pricing already exists to avoid overwriting custom tweaks
                if (
                    ServicePricing::where('service_id', $service->id)
                        ->where('vehicle_type_id', $type->id)
                        ->exists()
                ) {
                    continue;
                }

                $pricing = [
                    'service_id' => $service->id,
                    'vehicle_type_id' => $type->id,
                    'is_fixed' => $service->is_fixed,
                ];

                if ($service->is_fixed) {
                    $base = (float) $service->fixed_price;
                    $pricing['fixed_price'] = $this->roundPrice($base * $multiplier);
                    $pricing['min_price'] = $pricing['fixed_price'];
                    $pricing['max_price'] = $pricing['fixed_price'];
                } else {
                    $min = (float) $service->min_price;
                    $max = (float) $service->max_price;
                    $pricing['min_price'] = $this->roundPrice($min * $multiplier);
                    $pricing['max_price'] = $this->roundPrice($max * $multiplier);
                    $pricing['fixed_price'] = null;
                }

                ServicePricing::create($pricing);
            }
        }
    }

    private function roundPrice(float $price): float
    {
        // Round to nearest 5 or 10 for cleaner pricing
        return ceil($price / 5) * 5;
    }
}
