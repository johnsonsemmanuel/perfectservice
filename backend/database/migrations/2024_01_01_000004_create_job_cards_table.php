<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_cards', function (Blueprint $table) {
            $table->id();
            $table->string('job_number')->unique(); // JC-YYYYMM-XXXX
            $table->string('vehicle_number');
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_year', 4)->nullable();
            $table->string('vehicle_color')->nullable();
            $table->integer('mileage')->nullable();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('technician');
            $table->enum('status', ['open', 'in_progress', 'completed', 'invoiced', 'cancelled'])->default('open');
            $table->text('notes')->nullable();
            $table->text('diagnosis')->nullable();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('vehicle_number');
            $table->index('customer_phone');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_cards');
    }
};
