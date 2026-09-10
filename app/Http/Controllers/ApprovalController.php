<?php

namespace App\Http\Controllers;

use App\Models\StockIn;
use App\Services\ApprovalService;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    /**
     * Approve a stock in request
     */
    public function approveStockIn(Request $request, $id)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return redirect()->back()->with('error', 'Unauthorized');
        }

        try {
            ApprovalService::approveStockInRequest($id, auth()->id());
            
            // Return JSON for AJAX requests
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Stock in request approved successfully']);
            }
            
            return redirect()->back()->with('success', 'Stock in request approved successfully');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Failed to approve: ' . $e->getMessage()], 500);
            }
            return redirect()->back()->with('error', 'Failed to approve: ' . $e->getMessage());
        }
    }

    /**
     * Reject a stock in request
     */
    public function rejectStockIn(Request $request, $id)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return redirect()->back()->with('error', 'Unauthorized');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            ApprovalService::rejectStockInRequest($id, auth()->id(), $validated['reason']);
            
            // Return JSON for AJAX requests
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Stock in request rejected']);
            }
            
            return redirect()->back()->with('success', 'Stock in request rejected');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Failed to reject: ' . $e->getMessage()], 500);
            }
            return redirect()->back()->with('error', 'Failed to reject: ' . $e->getMessage());
        }
    }

    /**
     * Approve a stock out request
     */
    public function approveStockOut(Request $request, $id)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return redirect()->back()->with('error', 'Unauthorized');
        }

        try {
            ApprovalService::approveStockOutRequest($id, auth()->id());
            
            // Return JSON for AJAX requests
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => true, 
                    'message' => 'Stock out request approved successfully'
                ]);
            }
            
            return redirect()->back()->with('success', 'Stock out request approved successfully');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to approve: ' . $e->getMessage()
                ], 422);
            }
            return redirect()->back()->with('error', 'Failed to approve: ' . $e->getMessage());
        }
    }

    /**
     * Reject a stock out request
     */
    public function rejectStockOut(Request $request, $id)
    {
        // Check if user is admin
        if (auth()->user()->role->role_name !== 'Admin') {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            return redirect()->back()->with('error', 'Unauthorized');
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            ApprovalService::rejectStockOutRequest($id, auth()->id(), $validated['reason']);
            
            // Return JSON for AJAX requests
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Stock out request rejected'
                ]);
            }
            
            return redirect()->back()->with('success', 'Stock out request rejected');
        } catch (\Exception $e) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to reject: ' . $e->getMessage()
                ], 422);
            }
            return redirect()->back()->with('error', 'Failed to reject: ' . $e->getMessage());
        }
    }
}
