<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('registration');          // e.g. GR-1234-24
            $table->string('make')->nullable();
            $table->string('model')->nullable();
            $table->string('year', 4)->nullable();
            $table->string('color')->nullable();
            $table->string('vin')->nullable()->unique(); // chassis number
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('registration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_vehicles');
    }
};
