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
        // Find the admin user and update their email to 'admin'
        $adminRole = DB::table('roles')->where('role_name', 'Admin')->first();
        
        if ($adminRole) {
            DB::table('users')
                ->where('role_id', $adminRole->id)
                ->update(['email' => 'admin']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back - this won't work perfectly as we don't know the original email
        // But we can revert to a placeholder
        $adminRole = DB::table('roles')->where('role_name', 'Admin')->first();
        
        if ($adminRole) {
            DB::table('users')
                ->where('role_id', $adminRole->id)
                ->where('email', 'admin')
                ->update(['email' => 'test@example.com']);
        }
    }
};
