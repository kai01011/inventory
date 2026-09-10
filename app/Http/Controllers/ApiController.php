<?php

namespace App\Http\Controllers;

use App\Models\StockIn;
use App\Models\StockOut;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    /**
     * Get pending counts for sidebar notifications
     */
    public function getPendingCounts(Request $request)
    {
        $user = auth()->user();
        $user->load('role');
        
        if ($user->role->role_name === 'Admin') {
            // Admin sees all pending requests
            $stockInCount = StockIn::where('status', 'pending')->count();
            $stockOutCount = StockOut::where('status', 'pending')->count();
        } else {
            // Staff sees only their own pending requests
            $stockInCount = StockIn::where('status', 'pending')
                ->where('requested_by_id', $user->id)
                ->count();
            $stockOutCount = StockOut::where('status', 'pending')
                ->where('requested_by_id', $user->id)
                ->count();
        }
        
        // If this is an Inertia request, redirect to prevent the error
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }
        
        return response()->json([
            'stockIn' => $stockInCount,
            'stockOut' => $stockOutCount
        ]);
    }
}