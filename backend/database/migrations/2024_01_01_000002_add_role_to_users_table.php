<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->after('id')->constrained('roles')->restrictOnDelete();
            $table->string('pin', 255)->nullable()->after('password'); // Hashed manager PIN
            $table->boolean('is_active')->default(true)->after('pin');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn(['role_id', 'pin', 'is_active']);
            $table->dropSoftDeletes();
        });
    }
};
