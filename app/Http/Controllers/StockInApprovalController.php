<?php

namespace App\Http\Controllers;

use App\Models\StockIn;
use App\Services\ApprovalService;
use Illuminate\Http\Request;

class StockInApprovalController extends Controller
{
    /**
     * Approve a stock in request
     */
    public function approve($id)
    {
        try {
            $stockIn = StockIn::findOrFail($id);

            // Check if user is admin
            if (auth()->user()->role->role_name !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can approve stock in requests'
                ], 403);
            }

            // Check if already approved or rejected
            if ($stockIn->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This request has already been processed'
                ], 400);
            }

            // Use ApprovalService for consistent processing
            ApprovalService::approveStockInRequest($id, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Stock in request approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a stock in request
     */
    public function reject(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:500'
            ]);

            $stockIn = StockIn::findOrFail($id);

            // Check if user is admin
            if (auth()->user()->role->role_name !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can reject stock in requests'
                ], 403);
            }

            // Check if already approved or rejected
            if ($stockIn->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This request has already been processed'
                ], 400);
            }

            // Use ApprovalService for consistent processing
            ApprovalService::rejectStockInRequest($id, auth()->id(), $validated['reason']);

            return response()->json([
                'success' => true,
                'message' => 'Stock in request rejected'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject: ' . $e->getMessage()
            ], 500);
        }
    }
}