<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['role_name' => 'Admin'],
            ['role_name' => 'Manager'],
            ['role_name' => 'Staff'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['role_name' => $role['role_name']], $role);
        }
    }
}