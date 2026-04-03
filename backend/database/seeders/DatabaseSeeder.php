<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Service;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            ServiceSeeder::class,
            VehicleTypeSeeder::class,
            ServicePricingSeeder::class,
            SystemSettingSeeder::class,
            DefaultUserSeeder::class,
        ]);
    }
}
