<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Role;

class NotificationService
{
    /**
     * Notify admins of a new stock in request
     */
    public static function notifyStockInRequest($stockInId, $staffName, $itemCount): void
    {
        // Get all admin users
        $adminRole = Role::where('role_name', 'Admin')->first();
        
        if (!$adminRole) {
            return;
        }

        $admins = User::where('role_id', $adminRole->id)->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'stock_in_request',
                'related_id' => $stockInId,
                'title' => 'New Stock In Request',
                'message' => "{$staffName} has requested {$itemCount} product(s) for stock in.",
                'read' => false,
            ]);
        }
    }

    /**
     * Notify admins of a new stock out request
     */
    public static function notifyStockOutRequest($stockOutId, $staffName, $itemCount, $customerName): void
    {
        // Get all admin users
        $adminRole = Role::where('role_name', 'Admin')->first();
        
        if (!$adminRole) {
            return;
        }

        $admins = User::where('role_id', $adminRole->id)->get();

        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'stock_out_request',
                'related_id' => $stockOutId,
                'title' => 'New Stock Out Request',
                'message' => "{$staffName} has requested to send {$itemCount} product(s) to {$customerName}.",
                'read' => false,
            ]);
        }
    }

    /**
     * Notify user when their stock in request is approved
     */
    public static function notifyStockInApproval($stockIn, $adminName): void
    {
        if (!$stockIn->requestedBy) {
            return;
        }

        $itemCount = $stockIn->items->count();
        
        Notification::create([
            'user_id' => $stockIn->requested_by_id,
            'type' => 'stock_in_approved',
            'related_id' => $stockIn->id,
            'title' => 'Stock In Request Approved',
            'message' => "Your stock in request for {$itemCount} product(s) has been approved by {$adminName}.",
            'read' => false,
        ]);
    }

    /**
     * Notify user when their stock in request is rejected
     */
    public static function notifyStockInRejection($stockIn, $adminName, $reason = null): void
    {
        if (!$stockIn->requestedBy) {
            return;
        }

        $itemCount = $stockIn->items->count();
        $message = "Your stock in request for {$itemCount} product(s) has been rejected by {$adminName}.";
        
        if ($reason) {
            $message .= " Reason: {$reason}";
        }
        
        Notification::create([
            'user_id' => $stockIn->requested_by_id,
            'type' => 'stock_in_rejected',
            'related_id' => $stockIn->id,
            'title' => 'Stock In Request Rejected',
            'message' => $message,
            'read' => false,
        ]);
    }

    /**
     * Notify user when their stock out request is approved
     */
    public static function notifyStockOutApproval($stockOut, $adminName): void
    {
        if (!$stockOut->requestedBy) {
            return;
        }

        $itemCount = $stockOut->items->count();
        $customerName = $stockOut->customer ? $stockOut->customer->customer_name : 'customer';
        
        Notification::create([
            'user_id' => $stockOut->requested_by_id,
            'type' => 'stock_out_approved',
            'related_id' => $stockOut->id,
            'title' => 'Stock Out Request Approved',
            'message' => "Your stock out request for {$itemCount} product(s) to {$customerName} has been approved by {$adminName}.",
            'read' => false,
        ]);
    }

    /**
     * Notify user when their stock out request is rejected
     */
    public static function notifyStockOutRejection($stockOut, $adminName, $reason = null): void
    {
        if (!$stockOut->requestedBy) {
            return;
        }

        $itemCount = $stockOut->items->count();
        $customerName = $stockOut->customer ? $stockOut->customer->customer_name : 'customer';
        $message = "Your stock out request for {$itemCount} product(s) to {$customerName} has been rejected by {$adminName}.";
        
        if ($reason) {
            $message .= " Reason: {$reason}";
        }
        
        Notification::create([
            'user_id' => $stockOut->requested_by_id,
            'type' => 'stock_out_rejected',
            'related_id' => $stockOut->id,
            'title' => 'Stock Out Request Rejected',
            'message' => $message,
            'read' => false,
        ]);
    }

    /**
     * Get unread notifications count for a user
     */
    public static function getUnreadCount($userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('read', false)
            ->count();
    }

    /**
     * Get recent notifications for a user
     */
    public static function getRecentNotifications($userId, $limit = 10)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
