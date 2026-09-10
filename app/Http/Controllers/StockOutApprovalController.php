<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use App\Services\ApprovalService;
use Illuminate\Http\Request;

class StockOutApprovalController extends Controller
{
    /**
     * Approve a stock out request
     */
    public function approve($id)
    {
        try {
            $stockOut = StockOut::findOrFail($id);

            // Check if user is admin
            if (auth()->user()->role->role_name !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can approve stock out requests'
                ], 403);
            }

            // Check if already approved or rejected
            if ($stockOut->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This request has already been processed'
                ], 400);
            }

            // Use ApprovalService for consistent processing
            ApprovalService::approveStockOutRequest($id, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Stock out request approved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a stock out request
     */
    public function reject(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:500'
            ]);

            $stockOut = StockOut::findOrFail($id);

            // Check if user is admin
            if (auth()->user()->role->role_name !== 'Admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only admins can reject stock out requests'
                ], 403);
            }

            // Check if already approved or rejected
            if ($stockOut->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'This request has already been processed'
                ], 400);
            }

            // Use ApprovalService for consistent processing
            ApprovalService::rejectStockOutRequest($id, auth()->id(), $validated['reason']);

            return response()->json([
                'success' => true,
                'message' => 'Stock out request rejected'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject: ' . $e->getMessage()
            ], 500);
        }
    }
}
