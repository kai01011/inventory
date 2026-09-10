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
        // Create default roles
        \App\Models\Role::firstOrCreate(['role_name' => 'Admin']);
        \App\Models\Role::firstOrCreate(['role_name' => 'Manager']);
        \App\Models\Role::firstOrCreate(['role_name' => 'Staff']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\Role::whereIn('role_name', ['Admin', 'Manager', 'Staff'])->delete();
    }
};
