<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => Role::CASH_OFFICER,
                'display_name' => 'Cash Officer',
                'permissions' => [
                    'view_invoices',
                    'create_invoices',
                    'record_payments',
                    'view_job_cards',
                    'view_daily_closings',
                    'create_daily_closings',
                ],
            ],
            [
                'name' => Role::SERVICE_ADVISOR,
                'display_name' => 'Service Advisor',
                'permissions' => [
                    'view_job_cards',
                    'create_job_cards',
                    'edit_job_cards',
                    'update_job_card_status',
                    'view_services',
                    'view_invoices',
                ],
            ],
            [
                'name' => Role::MANAGER,
                'display_name' => 'Manager / Owner',
                'permissions' => [
                    // Full access
                    'view_invoices',
                    'create_invoices',
                    'void_invoices',
                    'record_payments',
                    'view_job_cards',
                    'create_job_cards',
                    'edit_job_cards',
                    'update_job_card_status',
                    'approve_job_cards',
                    'view_services',
                    'manage_services',
                    'manage_pricing',
                    'apply_discounts',
                    'override_pricing',
                    'view_audit_logs',
                    'view_daily_closings',
                    'create_daily_closings',
                    'resolve_daily_closings',
                    'manage_users',
                    'manage_settings',
                    'view_reports',
                ],
            ],
            [
                'name' => Role::TECHNICIAN,
                'display_name' => 'Technician',
                'permissions' => [
                    'view_job_cards',
                    'update_job_card_status',
                ],
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
