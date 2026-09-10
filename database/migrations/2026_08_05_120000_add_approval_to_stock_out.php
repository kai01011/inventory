<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_out', function (Blueprint $table) {
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable();
            $table->string('rejection_reason')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_out', function (Blueprint $table) {
            $table->dropForeign(['approved_by_id']);
            $table->dropColumn(['approved_by_id', 'approved_at', 'rejection_reason']);
        });
    }
};
