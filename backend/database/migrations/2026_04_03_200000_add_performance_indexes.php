<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_cards', function (Blueprint $table) {
            $table->index('status');
            $table->index('created_at');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index('status');
            $table->index('created_at');
            $table->index('job_card_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index('invoice_id');
            $table->index(['created_at', 'method']); // composite for cash/momo daily sums
        });

        Schema::table('pos_sales', function (Blueprint $table) {
            $table->index(['created_at', 'status']); // composite for daily summaries
            $table->index('served_by');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('is_active');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::table('job_cards', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['job_card_id']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['invoice_id']);
            $table->dropIndex(['created_at', 'method']);
        });

        Schema::table('pos_sales', function (Blueprint $table) {
            $table->dropIndex(['created_at', 'status']);
            $table->dropIndex(['served_by']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['category']);
        });
    }
};
