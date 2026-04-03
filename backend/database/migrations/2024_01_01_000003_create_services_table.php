<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // Maintenance, Brakes, Suspension, Electrical, Body, Tires, Engine
            $table->decimal('min_price', 10, 2);
            $table->decimal('max_price', 10, 2);
            $table->decimal('fixed_price', 10, 2)->nullable();
            $table->boolean('is_fixed')->default(false); // If true, price cannot vary
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
