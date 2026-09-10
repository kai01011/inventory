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
        Schema::table('stock_in', function (Blueprint $table) {
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->onDelete('set null')->after('requested_by_id');
            $table->timestamp('approved_at')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_in', function (Blueprint $table) {
            $table->dropForeignIdFor('users', 'approved_by_id');
            $table->dropColumn(['approved_by_id', 'approved_at']);
        });
    }
};
