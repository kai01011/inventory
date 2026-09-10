<?php

namespace App\Http\Controllers;

use App\Models\History;
use App\Models\StockIn;
use App\Models\StockOut;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HistoryController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('role');
        $isAdmin = $user->role->role_name === 'Admin';

        $query = History::with([
            'user', 
            'stockOut.requestedBy', 
            'stockIn.requestedBy'
        ])
            ->whereIn('status', ['approved', 'rejected'])
            ->orderBy('created_at', 'desc');

        // Non-admin users only see history related to their requests
        if (!$isAdmin) {
            $query->where(function ($query) use ($user) {
                $query->where('user_id', $user->id) // Their own actions
                      ->orWhereExists(function ($subQuery) use ($user) {
                          // Or actions on their stock in requests
                          $subQuery->select(\DB::raw(1))
                                   ->from('stock_in')
                                   ->whereColumn('stock_in.id', 'history.stock_in_id')
                                   ->where('stock_in.requested_by_id', $user->id);
                      })
                      ->orWhereExists(function ($subQuery) use ($user) {
                          // Or actions on their stock out requests
                          $subQuery->select(\DB::raw(1))
                                   ->from('stock_out')
                                   ->whereColumn('stock_out.id', 'history.stock_out_id')
                                   ->where('stock_out.requested_by_id', $user->id);
                      });
            });
        }

        $histories = $query->get()->map(function (History $h) {
            $data = $h->toArray();
            return array_merge($data, [
                'stock_out_status' => $h->stockOut?->status,
                'stock_in_status' => $h->stockIn?->status,
            ]);
        });

        return Inertia::render('History', [
            'histories' => $histories,
        ]);
    }

    /**
     * View details of an approved or rejected stock in request
     */
    public function viewStockInDetails($id)
    {
        $stockIn = StockIn::with([
            'items.category',
            'items.supplier', 
            'requestedBy',
            'approvedBy'
        ])->findOrFail($id);

        // Check if user has permission to view this
        $user = auth()->user();
        $user->load('role');
        $isAdmin = $user->role->role_name === 'Admin';
        
        if (!$isAdmin && $stockIn->requested_by_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Format timestamps directly from database without timezone conversion
        // Database already stores in Asia/Manila timezone
        $createdAt = null;
        $approvedAt = null;
        
        if ($stockIn->created_at) {
            // Format directly - no timezone conversion needed
            $createdAt = $stockIn->created_at->format('F j, Y g:i A');
        }
        
        if ($stockIn->approved_at) {
            $approvedAt = $stockIn->approved_at->format('F j, Y g:i A');
        }

        // Convert to array and override timestamps
        $formattedStockIn = $stockIn->toArray();
        $formattedStockIn['created_at'] = $createdAt;
        $formattedStockIn['approved_at'] = $approvedAt;

        return response()->json([
            'stockIn' => $formattedStockIn,
        ]);
    }

    /**
     * View details of an approved or rejected stock out request
     */
    public function viewStockOutDetails($id)
    {
        $stockOut = StockOut::with([
            'items.product',
            'customer',
            'requestedBy',
            'approvedBy'
        ])->findOrFail($id);

        // Check if user has permission to view this
        $user = auth()->user();
        $user->load('role');
        $isAdmin = $user->role->role_name === 'Admin';
        
        if (!$isAdmin && $stockOut->requested_by_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Format timestamps directly from database without timezone conversion
        // Database already stores in Asia/Manila timezone
        $createdAt = null;
        $approvedAt = null;
        
        if ($stockOut->created_at) {
            // Format directly - no timezone conversion needed
            $createdAt = $stockOut->created_at->format('F j, Y g:i A');
        }
        
        if ($stockOut->approved_at) {
            $approvedAt = $stockOut->approved_at->format('F j, Y g:i A');
        }

        // Convert to array and override timestamps
        $formattedStockOut = $stockOut->toArray();
        $formattedStockOut['created_at'] = $createdAt;
        $formattedStockOut['approved_at'] = $approvedAt;

        return response()->json([
            'stockOut' => $formattedStockOut,
        ]);
    }
}
