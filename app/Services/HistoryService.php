<?php

namespace App\Services;

use App\Models\History;
use App\Models\StockIn;
use App\Models\StockOut;

class HistoryService
{
    /**
     * Log a stock in request action
     */
    public static function logStockInRequest(StockIn $stockIn, string $status, int $userId): void
    {
        History::create([
            'stock_in_id' => $stockIn->id,
            'action_type' => 'stock_in',
            'status' => $status,
            'user_id' => $userId,
            'description' => "Stock in {$status}",
        ]);
    }

    /**
     * Log a stock out request action
     */
    public static function logStockOutRequest(StockOut $stockOut, string $status, int $userId): void
    {
        History::create([
            'stock_out_id' => $stockOut->id,
            'action_type' => 'stock_out',
            'status' => $status,
            'user_id' => $userId,
            'description' => "Stock out {$status}",
        ]);
    }

    /**
     * Log a stock in approval/rejection action
     */
    public static function logStockInApproval(StockIn $stockIn, string $status, int $userId, ?string $reason = null): void
    {
        $description = "Stock in {$status}";
        if ($reason) {
            $description .= " - Reason: {$reason}";
        }

        // Since we no longer create pending entries, always create a new entry
        History::create([
            'stock_in_id' => $stockIn->id,
            'action_type' => 'stock_in',
            'status' => $status,
            'user_id' => $userId,
            'description' => $description,
        ]);
    }
    public static function logStockOutApproval(StockOut $stockOut, string $status, int $userId, ?string $reason = null): void
    {
        $description = "Stock out {$status}";
        if ($reason) {
            $description .= " - Reason: {$reason}";
        }

        // Since we no longer create pending entries, always create a new entry
        History::create([
            'stock_out_id' => $stockOut->id,
            'action_type' => 'stock_out',
            'status' => $status,
            'user_id' => $userId,
            'description' => $description,
        ]);
    }

    /**
     * Get recent history entries — optionally scoped to a specific user
     * For staff users, this will show entries for their stock in/out requests,
     * regardless of who actually performed the approval/rejection
     */
    public static function getRecentHistory($limit = 10, ?int $userId = null)
    {
        $query = History::with(['user', 'stockIn', 'stockOut'])
            ->whereIn('status', ['approved', 'rejected'])
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($userId !== null) {
            // For non-admin users, show history entries related to their requests
            // This includes approvals/rejections done by admins on their requests
            $query->where(function ($query) use ($userId) {
                $query->where('user_id', $userId) // Their own actions
                      ->orWhereExists(function ($subQuery) use ($userId) {
                          // Or approvals/rejections of their stock in requests
                          $subQuery->select(\DB::raw(1))
                                   ->from('stock_in')
                                   ->whereColumn('stock_in.id', 'history.stock_in_id')
                                   ->where('stock_in.requested_by_id', $userId);
                      })
                      ->orWhereExists(function ($subQuery) use ($userId) {
                          // Or approvals/rejections of their stock out requests
                          $subQuery->select(\DB::raw(1))
                                   ->from('stock_out')
                                   ->whereColumn('stock_out.id', 'history.stock_out_id')
                                   ->where('stock_out.requested_by_id', $userId);
                      });
            });
        }

        return $query->get();
    }
}
