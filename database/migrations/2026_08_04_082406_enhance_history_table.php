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
        Schema::table('history', function (Blueprint $table) {
            $table->string('action_type')->nullable()->after('stock_out_id'); // 'stock_in' or 'stock_out'
            $table->string('status')->nullable()->after('action_type'); // 'pending', 'approved', 'rejected'
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null')->after('status');
            $table->text('description')->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('history', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['action_type', 'status', 'user_id', 'description']);
        });
    }
};
