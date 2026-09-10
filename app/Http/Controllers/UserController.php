<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index()
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can manage users.');
        }

        // Get users and format their dates properly for Philippine timezone
        $users = User::with('role')->orderBy('name')->get()->map(function ($user) {
            // Format created_at to match the expected format in frontend
            $createdAt = $user->created_at ? Carbon::parse($user->created_at)->format('Y-m-d\TH:i:s.u\Z') : null;
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'role' => $user->role,
                'created_at' => $createdAt,
                'updated_at' => $user->updated_at,
            ];
        });
        
        $roles = Role::orderBy('role_name')->get();
        
        return Inertia::render('Users', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can manage users.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $request->role_id,
        ]);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, $id)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can manage users.');
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role_id' => 'required|exists:roles,id',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role_id' => $request->role_id,
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:8',
            ]);
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can manage users.');
        }

        $user = User::findOrFail($id);
        
        // Prevent deletion of current user
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}