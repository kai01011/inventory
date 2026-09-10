<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Assign Staff role (id: 3) to user named 'brent'
        DB::table('users')
            ->where('name', 'brent')
            ->update(['role_id' => 3]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove Staff role from user named 'brent'
        DB::table('users')
            ->where('name', 'brent')
            ->update(['role_id' => null]);
    }
};
