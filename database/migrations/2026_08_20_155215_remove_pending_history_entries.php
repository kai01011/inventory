<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove all pending history entries since history should only show completed actions
        DB::table('history')
            ->where('status', 'pending')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse this migration as we've deleted the pending entries
        // This is intentional as pending entries should not be in history
    }
};