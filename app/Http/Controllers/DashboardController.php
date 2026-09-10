<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\Category;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Services\HistoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $totalProducts = Product::count();
        $lowStockCount = Product::where('quantity', '<', 10)->count();
        $totalSuppliers = Supplier::count();
        $totalCustomers = Customer::count();
        $totalCategories = Category::count();

        // Get Stock In and Stock Out counts for this month
        // Admin sees overall counts; regular users see only their own
        $isAdmin = $user->load('role')->role->role_name === 'Admin';
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        $stockInQuery = StockIn::where('status', 'approved')
            ->whereBetween('created_at', [$monthStart, $monthEnd]);
        $stockOutQuery = StockOut::where('status', 'approved')
            ->whereBetween('created_at', [$monthStart, $monthEnd]);

        if (!$isAdmin) {
            $stockInQuery->where('requested_by_id', $user->id);
            $stockOutQuery->where('requested_by_id', $user->id);
        }

        $stockInCount  = $stockInQuery->count();
        $stockOutCount = $stockOutQuery->count();

        // Get low stock items with more details
        $lowStockItems = Product::where('quantity', '<', 10)
            ->with(['category', 'supplier'])
            ->select('id', 'product_name', 'quantity', 'category_id', 'supplier_id')
            ->orderBy('quantity', 'asc')
            ->limit(10)
            ->get()
            ->map(fn ($product) => [
                'id' => $product->id,
                'product_name' => $product->product_name,
                'quantity' => $product->quantity,
                'category' => $product->category?->category_name ?? 'N/A',
                'supplier' => $product->supplier?->supplier_name ?? 'N/A',
                'status' => $product->quantity < 5 ? 'critical' : 'low',
            ])
            ->toArray();

        // Get recent history entries — admin sees all, staff sees own only
        $historyEntries = \App\Services\HistoryService::getRecentHistory(15, $isAdmin ? null : $user->id);

        // Format history for display
        $recentActivity = $historyEntries->map(function ($entry) {
            $totalQty = 0;
            $user = \App\Models\User::find($entry->user_id);
            $timestamp = $entry->created_at;
            $itemCount = 0;
            
            if ($entry->action_type === 'stock_in' && $entry->stock_in_id) {
                $stockIn = \App\Models\StockIn::find($entry->stock_in_id);
                if ($stockIn) {
                    $items = $stockIn->items ?? [];
                    $totalQty = $items->sum('stock_in_quantity');
                    $itemCount = $items->count();
                    
                    // Determine the item description based on status
                    $itemDescription = match($entry->status) {
                        'pending' => "Stock In Request ({$itemCount} items)",
                        'approved' => "Stock In Approved ✓ ({$itemCount} items)",
                        'rejected' => "Stock In Rejected ✗ ({$itemCount} items)",
                        default => "Stock In Request ({$itemCount} items)"
                    };
                }
                return [
                    'id' => $entry->id,
                    'item' => $itemDescription ?? 'Stock In Request',
                    'type' => 'stock_in',
                    'quantity' => $totalQty,
                    'item_count' => $itemCount,
                    'status' => $entry->status,
                    'user' => $user?->name ?? 'Unknown',
                    'created_at' => $timestamp,
                    'formatted_time' => $timestamp->format('M d, h:i A'),
                ];
            } elseif ($entry->action_type === 'stock_out' && $entry->stock_out_id) {
                $stockOut = \App\Models\StockOut::find($entry->stock_out_id);
                if ($stockOut) {
                    $items = $stockOut->items ?? [];
                    $totalQty = $items->sum('stock_out_quantity');
                    $itemCount = $items->count();
                    
                    // Determine the item description based on status
                    $itemDescription = match($entry->status) {
                        'pending' => "Stock Out Request ({$itemCount} items)",
                        'approved' => "Stock Out Approved ✓ ({$itemCount} items)",
                        'rejected' => "Stock Out Rejected ✗ ({$itemCount} items)",
                        default => "Stock Out Request ({$itemCount} items)"
                    };
                }
                return [
                    'id' => $entry->id,
                    'item' => $itemDescription ?? 'Stock Out Request',
                    'type' => 'stock_out',
                    'quantity' => $totalQty,
                    'item_count' => $itemCount,
                    'status' => $entry->status,
                    'user' => $user?->name ?? 'Unknown',
                    'created_at' => $timestamp,
                    'formatted_time' => $timestamp->format('M d, h:i A'),
                ];
            }
            
            return null;
        })->filter()->values()->toArray();

        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => [
                ['label' => 'Total Products', 'value' => (string)$totalProducts, 'change' => 'In inventory', 'icon' => 'package'],
                ['label' => 'Low Stock', 'value' => (string)$lowStockCount, 'change' => 'Needs attention', 'icon' => 'alert-circle'],
                ['label' => 'Stock In', 'value' => (string)$stockInCount, 'change' => 'This month', 'icon' => 'arrow-down-left'],
                ['label' => 'Stock Out', 'value' => (string)$stockOutCount, 'change' => 'This month', 'icon' => 'arrow-up-right'],
            ],
            'inventorySummary' => [
                'categories' => $totalCategories,
                'suppliers' => $totalSuppliers,
                'customers' => $totalCustomers,
                'total_products' => $totalProducts,
            ],
            'lowStockItems' => $lowStockItems,
            'recentActivity' => $recentActivity,
        ]);
    }
}
