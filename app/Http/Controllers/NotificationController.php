<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get unread notification count
     */
    public function getUnreadCount(Request $request)
    {
        $count = NotificationService::getUnreadCount(auth()->id());
        
        // If this is an Inertia request, redirect to prevent the error
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }
        
        return response()->json([
            'unread_count' => $count,
        ]);
    }

    /**
     * Get recent notifications
     */
    public function getRecent(Request $request)
    {
        $limit = $request->query('limit', 10);
        $notifications = NotificationService::getRecentNotifications(auth()->id(), $limit);
        
        // If this is an Inertia request, redirect to prevent the error
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }
        
        return response()->json([
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();
        
        $notification->markAsRead();
        
        // If this is an Inertia request, redirect to prevent the error
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }
        
        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', auth()->id())
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
        
        // If this is an Inertia request, redirect to prevent the error
        if ($request->header('X-Inertia')) {
            return redirect()->back();
        }
        
        return response()->json([
            'success' => true,
        ]);
    }
}
