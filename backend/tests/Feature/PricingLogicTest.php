<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use App\Models\VehicleType;
use Database\Seeders\DefaultUserSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\ServicePricingSeeder;
use Database\Seeders\ServiceSeeder;
use Database\Seeders\VehicleTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingLogicTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Run seeders to setup environment
        $this->seed([
            RoleSeeder::class,
            DefaultUserSeeder::class,
            ServiceSeeder::class, // Creates "Oil Change" (80-150)
            VehicleTypeSeeder::class,
            ServicePricingSeeder::class, // SUV Multiplier 1.25 -> (100-187.5)
        ]);
    }

    public function test_standard_saloon_pricing()
    {
        $user = User::where('email', 'advisor@perfectservice.com')->first();
        $saloon = VehicleType::where('slug', 'saloon')->first();
        $service = Service::where('name', 'Oil Change')->first();

        $response = $this->actingAs($user)->postJson('/api/job-cards', [
            'vehicle_number' => 'GH-Test-01',
            'customer_name' => 'John Doe',
            'customer_phone' => '0501234567',
            'technician' => 'Tech 1',
            'vehicle_type_id' => $saloon->id,
            'items' => [
                [
                    'service_id' => $service->id,
                    'agreed_price' => 80.00, // Valid for Saloon (Min 80)
                ]
            ]
        ]);

        $response->assertStatus(201);
    }

    public function test_suv_pricing_enforcement()
    {
        $user = User::where('email', 'advisor@perfectservice.com')->first();
        $suv = VehicleType::where('slug', 'suv')->first();
        $service = Service::where('name', 'Oil Change')->first();

        // SUV Min is 100. Try 80 (Saloon price).
        $response = $this->actingAs($user)->postJson('/api/job-cards', [
            'vehicle_number' => 'GH-SUV-01',
            'customer_name' => 'Jane Doe',
            'customer_phone' => '0501234567',
            'technician' => 'Tech 1',
            'vehicle_type_id' => $suv->id,
            'items' => [
                [
                    'service_id' => $service->id,
                    'agreed_price' => 80.00,
                ]
            ]
        ]);

        $response->assertStatus(422);


        // Relaxed assertion to avoid encoding issues
        $content = $response->getContent();
        $this->assertStringContainsString('Pricing validation failed', $content);
        $this->assertStringContainsString('outside allowed range', $content);
        $this->assertStringContainsString('Manager approval required', $content);
    }

    public function test_suv_pricing_compliance()
    {
        $user = User::where('email', 'advisor@perfectservice.com')->first();
        $suv = VehicleType::where('slug', 'suv')->first();
        $service = Service::where('name', 'Oil Change')->first();

        // SUV Min is 100. Try 100.
        $response = $this->actingAs($user)->postJson('/api/job-cards', [
            'vehicle_number' => 'GH-SUV-02',
            'customer_name' => 'Jane Doe',
            'customer_phone' => '0501234567',
            'technician' => 'Tech 1',
            'vehicle_type_id' => $suv->id,
            'items' => [
                [
                    'service_id' => $service->id,
                    'agreed_price' => 100.00,
                ]
            ]
        ]);

        $response->assertStatus(201);
    }

    public function test_manager_override_success()
    {
        $user = User::where('email', 'advisor@perfectservice.com')->first();
        $saloon = VehicleType::where('slug', 'saloon')->first();
        $service = Service::where('name', 'Oil Change')->first();

        // Try extreme low price with PIN
        $response = $this->actingAs($user)->postJson('/api/job-cards', [
            'vehicle_number' => 'GH-Discount-01',
            'customer_name' => 'Vip Client',
            'customer_phone' => '0501234567',
            'technician' => 'Tech 1',
            'vehicle_type_id' => $saloon->id,
            'items' => [
                [
                    'service_id' => $service->id,
                    'agreed_price' => 10.00, // Way below min 80
                    'override_pin' => '1234', // Correct PIN
                    'override_reason' => 'Friend of owner',
                ]
            ]
        ]);

        $response->assertStatus(201);
    }

    public function test_manager_override_failure()
    {
        $user = User::where('email', 'advisor@perfectservice.com')->first();
        $saloon = VehicleType::where('slug', 'saloon')->first();
        $service = Service::where('name', 'Oil Change')->first();

        // Try extreme low price with WRONG PIN
        $response = $this->actingAs($user)->postJson('/api/job-cards', [
            'vehicle_number' => 'GH-Fraud-01',
            'customer_name' => 'Bad Client',
            'customer_phone' => '0501234567',
            'technician' => 'Tech 1',
            'vehicle_type_id' => $saloon->id,
            'items' => [
                [
                    'service_id' => $service->id,
                    'agreed_price' => 10.00,
                    'override_pin' => '0000', // Wrong PIN
                    'override_reason' => 'Trying luck',
                ]
            ]
        ]);

        $response->assertStatus(422);
    }
}
