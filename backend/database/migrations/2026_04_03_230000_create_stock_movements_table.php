<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            // type: 'in' = stock received, 'out' = sold/used, 'adjustment' = manual correction
            $table->enum('type', ['in', 'out', 'adjustment', 'sale']);
            $table->integer('quantity');            // positive = added, negative = removed
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->string('reference')->nullable(); // e.g. POS sale receipt number
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
