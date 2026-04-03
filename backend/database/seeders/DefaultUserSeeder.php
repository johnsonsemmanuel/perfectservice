<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DefaultUserSeeder extends Seeder
{
    public function run(): void
    {
        $managerRole = Role::where('name', Role::MANAGER)->first();
        $cashOfficerRole = Role::where('name', Role::CASH_OFFICER)->first();
        $serviceAdvisorRole = Role::where('name', Role::SERVICE_ADVISOR)->first();

        // Default Manager account
        User::updateOrCreate(
            ['email' => 'manager@perfectservice.com'],
            [
                'name' => 'Admin Manager',
                'password' => bcrypt('password'),
                'role_id' => $managerRole->id,
                'pin' => bcrypt('1234'), // Default manager PIN
                'is_active' => true,
            ]
        );

        // Default Cash Officer
        User::updateOrCreate(
            ['email' => 'cashier@perfectservice.com'],
            [
                'name' => 'Cash Officer',
                'password' => bcrypt('password'),
                'role_id' => $cashOfficerRole->id,
                'is_active' => true,
            ]
        );

        // Default Service Advisor
        User::updateOrCreate(
            ['email' => 'advisor@perfectservice.com'],
            [
                'name' => 'Service Advisor',
                'password' => bcrypt('password'),
                'role_id' => $serviceAdvisorRole->id,
                'is_active' => true,
            ]
        );

        // Default Technician
        $technicianRole = Role::where('name', Role::TECHNICIAN)->first();
        if ($technicianRole) {
            User::updateOrCreate(
                ['email' => 'tech@perfectservice.com'],
                [
                    'name' => 'Lead Technician',
                    'password' => bcrypt('password'),
                    'role_id' => $technicianRole->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
