<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            // Maintenance
            ['name' => 'Oil Change', 'category' => 'Maintenance', 'min_price' => 80.00, 'max_price' => 150.00, 'is_fixed' => false, 'description' => 'Engine oil and filter replacement'],
            ['name' => 'Oil Filter Replacement', 'category' => 'Maintenance', 'min_price' => 30.00, 'max_price' => 60.00, 'is_fixed' => false, 'description' => 'Oil filter change only'],
            ['name' => 'Air Filter Replacement', 'category' => 'Maintenance', 'min_price' => 40.00, 'max_price' => 80.00, 'is_fixed' => false, 'description' => 'Engine air filter replacement'],
            ['name' => 'Spark Plug Replacement', 'category' => 'Maintenance', 'min_price' => 60.00, 'max_price' => 200.00, 'is_fixed' => false, 'description' => 'Replace spark plugs (set)'],
            ['name' => 'Coolant Flush', 'category' => 'Maintenance', 'min_price' => 100.00, 'max_price' => 250.00, 'is_fixed' => false, 'description' => 'Complete coolant system flush and refill'],

            // Brakes
            ['name' => 'Brake Pad Replacement (Front)', 'category' => 'Brakes', 'min_price' => 200.00, 'max_price' => 500.00, 'is_fixed' => false, 'description' => 'Front brake pad replacement'],
            ['name' => 'Brake Pad Replacement (Rear)', 'category' => 'Brakes', 'min_price' => 200.00, 'max_price' => 500.00, 'is_fixed' => false, 'description' => 'Rear brake pad replacement'],
            ['name' => 'Brake Disc Turning', 'category' => 'Brakes', 'min_price' => 100.00, 'max_price' => 300.00, 'is_fixed' => false, 'description' => 'Brake disc resurfacing'],
            ['name' => 'Brake Fluid Change', 'category' => 'Brakes', 'min_price' => 60.00, 'max_price' => 120.00, 'is_fixed' => false, 'description' => 'Complete brake fluid flush'],

            // Suspension
            ['name' => 'Wheel Alignment', 'category' => 'Suspension', 'min_price' => 100.00, 'max_price' => 100.00, 'fixed_price' => 100.00, 'is_fixed' => true, 'description' => 'Four-wheel alignment'],
            ['name' => 'Wheel Balancing', 'category' => 'Suspension', 'min_price' => 60.00, 'max_price' => 60.00, 'fixed_price' => 60.00, 'is_fixed' => true, 'description' => 'Four-wheel balancing'],
            ['name' => 'Shock Absorber Replacement', 'category' => 'Suspension', 'min_price' => 300.00, 'max_price' => 800.00, 'is_fixed' => false, 'description' => 'Per shock absorber replacement'],

            // Electrical
            ['name' => 'AC Regas', 'category' => 'Electrical', 'min_price' => 150.00, 'max_price' => 300.00, 'is_fixed' => false, 'description' => 'Air conditioning regas and leak check'],
            ['name' => 'Battery Replacement', 'category' => 'Electrical', 'min_price' => 200.00, 'max_price' => 600.00, 'is_fixed' => false, 'description' => 'Car battery replacement'],
            ['name' => 'Diagnostic Scan', 'category' => 'Electrical', 'min_price' => 50.00, 'max_price' => 50.00, 'fixed_price' => 50.00, 'is_fixed' => true, 'description' => 'OBD-II diagnostic scan'],
            ['name' => 'Alternator Repair', 'category' => 'Electrical', 'min_price' => 200.00, 'max_price' => 500.00, 'is_fixed' => false, 'description' => 'Alternator repair or replacement'],
            ['name' => 'Starter Motor Repair', 'category' => 'Electrical', 'min_price' => 200.00, 'max_price' => 600.00, 'is_fixed' => false, 'description' => 'Starter motor repair or replacement'],

            // Body
            ['name' => 'Full Body Spray', 'category' => 'Body', 'min_price' => 2000.00, 'max_price' => 5000.00, 'is_fixed' => false, 'description' => 'Complete vehicle respray'],
            ['name' => 'Panel Beating', 'category' => 'Body', 'min_price' => 300.00, 'max_price' => 2000.00, 'is_fixed' => false, 'description' => 'Dent repair and panel work'],
            ['name' => 'Windshield Replacement', 'category' => 'Body', 'min_price' => 400.00, 'max_price' => 1500.00, 'is_fixed' => false, 'description' => 'Windshield glass replacement'],

            // Tires
            ['name' => 'Tire Rotation', 'category' => 'Tires', 'min_price' => 40.00, 'max_price' => 80.00, 'is_fixed' => false, 'description' => 'Rotate all four tires'],
            ['name' => 'Tire Repair (Puncture)', 'category' => 'Tires', 'min_price' => 20.00, 'max_price' => 50.00, 'is_fixed' => false, 'description' => 'Tire puncture repair'],
            ['name' => 'Tire Replacement', 'category' => 'Tires', 'min_price' => 150.00, 'max_price' => 800.00, 'is_fixed' => false, 'description' => 'Single tire replacement (price varies by size)'],

            // Engine
            ['name' => 'Engine Tune-Up', 'category' => 'Engine', 'min_price' => 300.00, 'max_price' => 800.00, 'is_fixed' => false, 'description' => 'Complete engine tune-up'],
            ['name' => 'Timing Belt Replacement', 'category' => 'Engine', 'min_price' => 500.00, 'max_price' => 1500.00, 'is_fixed' => false, 'description' => 'Timing belt/chain replacement'],
            ['name' => 'Head Gasket Replacement', 'category' => 'Engine', 'min_price' => 800.00, 'max_price' => 3000.00, 'is_fixed' => false, 'description' => 'Cylinder head gasket replacement'],
            ['name' => 'Transmission Service', 'category' => 'Engine', 'min_price' => 200.00, 'max_price' => 500.00, 'is_fixed' => false, 'description' => 'Transmission fluid change and service'],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(
                ['name' => $service['name']],
                $service
            );
        }
    }
}
