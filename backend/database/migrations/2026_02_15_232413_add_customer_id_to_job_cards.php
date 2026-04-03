<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('job_cards', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('id')->constrained('customers')->nullOnDelete();
        });

        // Migrate existing data
        $jobCards = \Illuminate\Support\Facades\DB::table('job_cards')->get();
        foreach ($jobCards as $job) {
            // Find existing customer by phone (primary) or email or name
            $query = \Illuminate\Support\Facades\DB::table('customers');

            if ($job->customer_phone) {
                // Remove spaces/dashes for better matching? For now, exact match.
                $query->where('phone', $job->customer_phone);
            } elseif ($job->customer_email) {
                $query->where('email', $job->customer_email);
            } else {
                $query->where('name', $job->customer_name);
            }

            $customer = $query->first();

            if (!$customer) {
                $customerId = \Illuminate\Support\Facades\DB::table('customers')->insertGetId([
                    'name' => $job->customer_name,
                    'email' => $job->customer_email,
                    'phone' => $job->customer_phone,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $customerId = $customer->id;
            }

            \Illuminate\Support\Facades\DB::table('job_cards')
                ->where('id', $job->id)
                ->update(['customer_id' => $customerId]);
        }
    }

    public function down(): void
    {
        Schema::table('job_cards', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });
    }
};
