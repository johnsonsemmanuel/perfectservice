<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Receipt footer — LOCKED, cannot be edited via API
            [
                'key' => 'receipt_footer_line_1',
                'value' => 'Prices are subject to inspection.',
                'type' => 'string',
                'is_locked' => true,
                'group' => 'receipt',
                'description' => 'Receipt footer line 1 — locked by system policy',
            ],
            [
                'key' => 'receipt_footer_line_2',
                'value' => 'Customer-supplied parts carry no warranty.',
                'type' => 'string',
                'is_locked' => true,
                'group' => 'receipt',
                'description' => 'Receipt footer line 2 — locked by system policy',
            ],
            [
                'key' => 'receipt_footer_line_3',
                'value' => 'Full payment required before vehicle release.',
                'type' => 'string',
                'is_locked' => true,
                'group' => 'receipt',
                'description' => 'Receipt footer line 3 — locked by system policy',
            ],

            // Business info
            [
                'key' => 'business_name',
                'value' => 'PerfectService Auto',
                'type' => 'string',
                'is_locked' => false,
                'group' => 'business',
                'description' => 'Business name displayed on receipts and invoices',
            ],
            [
                'key' => 'business_phone',
                'value' => '',
                'type' => 'string',
                'is_locked' => false,
                'group' => 'business',
                'description' => 'Business phone number',
            ],
            [
                'key' => 'business_address',
                'value' => '',
                'type' => 'string',
                'is_locked' => false,
                'group' => 'business',
                'description' => 'Business physical address',
            ],
            [
                'key' => 'business_email',
                'value' => '',
                'type' => 'string',
                'is_locked' => false,
                'group' => 'business',
                'description' => 'Business email address',
            ],

            // Pricing controls
            [
                'key' => 'max_discount_percent',
                'value' => '10',
                'type' => 'integer',
                'is_locked' => true,
                'group' => 'pricing',
                'description' => 'Maximum discount percentage allowed — locked by system policy',
            ],
            [
                'key' => 'default_tax_percent',
                'value' => '0',
                'type' => 'integer',
                'is_locked' => false,
                'group' => 'pricing',
                'description' => 'Default VAT/tax percentage for invoices',
            ],

            // General
            [
                'key' => 'currency',
                'value' => 'GHS',
                'type' => 'string',
                'is_locked' => true,
                'group' => 'general',
                'description' => 'System currency — Ghana Cedi',
            ],
            [
                'key' => 'currency_symbol',
                'value' => 'GH₵',
                'type' => 'string',
                'is_locked' => true,
                'group' => 'general',
                'description' => 'Currency symbol for display',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
