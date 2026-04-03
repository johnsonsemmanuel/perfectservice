<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // SECURITY: Audit logs have NO soft deletes — they are permanent records
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // price_override, discount_applied, invoice_voided, unauthorized_attempt, etc.
            $table->string('entity_type'); // invoice, job_card, service, payment, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->text('reason')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('severity')->default('info'); // info, warning, critical
            $table->timestamps();

            // NO soft deletes — audit logs are immutable
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
            $table->index('user_id');
            $table->index('severity');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
