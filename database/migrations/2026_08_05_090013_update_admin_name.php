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
        // Update the admin user's name from "Test User" to "Admin"
        DB::table('users')
            ->where('name', 'Test User')
            ->update(['name' => 'Admin']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to "Test User"
        DB::table('users')
            ->where('name', 'Admin')
            ->where('email', 'admin')
            ->update(['name' => 'Test User']);
    }
};
