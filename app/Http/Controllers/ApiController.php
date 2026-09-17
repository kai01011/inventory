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
        
        return response()->json([
            'stockIn' => $stockInCount,
            'stockOut' => $stockOutCount
        ]);
    }

    /**
     * Get real-time stock in list
     */
    public function getStockInList(Request $request)
    {
        $user = auth()->user();
        $user->load('role');
        
        $query = StockIn::with(['items.product', 'requestedBy', 'approvedBy']);
        
        // Filter based on user role
        if ($user->role->role_name !== 'Admin') {
            $query->where('requested_by_id', $user->id);
        }
        
        $stockIns = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'stock_ins' => $stockIns
        ]);
    }

    /**
     * Get real-time stock out list
     */
    public function getStockOutList(Request $request)
    {
        $user = auth()->user();
        $user->load('role');
        
        $query = StockOut::with(['items.product', 'requestedBy', 'approvedBy', 'deliveredBy', 'customer']);
        
        // Filter based on user role
        if ($user->role->role_name !== 'Admin') {
            $query->where('requested_by_id', $user->id);
        }
        
        $stockOuts = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'stock_outs' => $stockOuts
        ]);
    }
}
