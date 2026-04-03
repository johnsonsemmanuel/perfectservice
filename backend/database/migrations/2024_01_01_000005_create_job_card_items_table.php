<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_card_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_card_id')->constrained('job_cards')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->decimal('agreed_price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->decimal('line_total', 10, 2);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('job_card_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_card_items');
    }
};
