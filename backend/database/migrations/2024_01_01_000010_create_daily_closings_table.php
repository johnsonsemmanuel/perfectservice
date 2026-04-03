<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('daily_closings', function (Blueprint $table) {
            $table->id();
            $table->date('closing_date')->unique();
            $table->decimal('cash_total', 12, 2)->default(0);
            $table->decimal('momo_total', 12, 2)->default(0);
            $table->decimal('expected_total', 12, 2)->default(0);
            $table->decimal('actual_cash', 12, 2)->nullable();
            $table->decimal('actual_momo', 12, 2)->nullable();
            $table->decimal('discrepancy', 12, 2)->default(0);
            $table->integer('total_invoices')->default(0);
            $table->integer('total_job_cards')->default(0);
            $table->json('service_breakdown')->nullable(); // Service-wise revenue breakdown
            $table->enum('status', ['open', 'closed', 'flagged'])->default('open');
            $table->text('notes')->nullable();
            $table->text('flag_reason')->nullable();
            $table->foreignId('closed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index('closing_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_closings');
    }
};
