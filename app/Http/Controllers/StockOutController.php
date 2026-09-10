<?php

namespace App\Http\Controllers;

use App\Models\StockOut;
use App\Models\Customer;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockOutController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('role');
        
        // Filter stock outs based on user role and load all necessary relationships
        if ($user->role->role_name === 'Admin') {
            // Admin sees all stock outs
            $stockOuts = StockOut::with([
                'customer',
                'items.product',
                'requestedBy' // This is the 'user' relationship the frontend expects
            ])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('updated_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        } else {
            // Staff sees only their own stock outs
            $stockOuts = StockOut::where('requested_by_id', $user->id)
                ->with([
                    'customer',
                    'items.product', 
                    'requestedBy' // This is the 'user' relationship the frontend expects
                ])
                ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
                ->orderBy('updated_at', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        // Transform the data to include user relationship alias
        $stockOuts = $stockOuts->map(function ($stockOut) {
            $stockOut->user = $stockOut->requestedBy; // Frontend expects 'user' property
            return $stockOut;
        });
        
        $customers = Customer::all();
        $products = \App\Models\Product::where('deleted_at', null)->get();
        
        return Inertia::render('StockOut', [
            'stockOuts' => $stockOuts,
            'customers' => $customers,
            'products' => $products,
            'isAdmin' => $user->role->role_name === 'Admin',
            'userRole' => $user->role->role_name,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'delivered_to_id' => 'required|exists:customers,id',
            'address' => 'required|string',
            'tin' => 'nullable|string',
            'remarks' => 'nullable|string',
            'business_style' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.stock_out_quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Auto-generate delivery number
        $lastStockOut = StockOut::orderBy('id', 'desc')->first();
        $nextNumber = ($lastStockOut?->id ?? 0) + 1;
        $deliveryNo = str_pad($nextNumber, 5, '0', STR_PAD_LEFT);

        \DB::beginTransaction();

        try {
            $stockOut = StockOut::create([
                'requested_by_id' => auth()->id(),
                'delivered_to_id' => $validated['delivered_to_id'],
                'delivery_no' => $deliveryNo,
                'address' => $validated['address'],
                'tin' => $validated['tin'],
                'remarks' => $validated['remarks'],
                'status' => 'pending', // Always set to pending on creation
                'business_style' => $validated['business_style'],
            ]);

            // Add items (do NOT decrease quantities until admin approves)
            foreach ($validated['items'] as $item) {
                \App\Models\StockOutItem::create([
                    'stock_out_id' => $stockOut->id,
                    'product_id' => $item['product_id'],
                    'stock_out_quantity' => $item['stock_out_quantity'],
                    'unit_price' => $item['unit_price'],
                ]);
            }

            // Log to history - removed pending logging as history should only show completed actions
            // \App\Services\HistoryService::logStockOutRequest($stockOut, 'pending', auth()->id());

            // Notify admins of the new stock out request
            $customer = Customer::find($validated['delivered_to_id']);
            NotificationService::notifyStockOutRequest(
                $stockOut->id,
                auth()->user()->name,
                count($validated['items']),
                $customer->customer_name
            );

            \DB::commit();

            // Return JSON for AJAX requests, redirect for regular requests
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Stock out request created successfully',
                    'stock_out_id' => $stockOut->id,
                ]);
            }
            
            return redirect('/stock-out');
        } catch (\Exception $e) {
            \DB::rollBack();
            
            // Return JSON error for AJAX requests
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create stock out: ' . $e->getMessage(),
                ], 422);
            }
            
            throw $e;
        }
    }

    public function destroy($id)
    {
        $stockOut = StockOut::findOrFail($id);
        $stockOut->delete();
        
        return redirect('/stock-out');
    }

    // Debug method to check database content
    public function debug()
    {
        $user = auth()->user();
        $allStockOuts = StockOut::with('requestedBy')->get();
        
        $debug = [
            'current_user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role->role_name ?? 'No role'
            ],
            'total_stock_outs' => $allStockOuts->count(),
            'stock_outs' => $allStockOuts->map(function($so) {
                return [
                    'id' => $so->id,
                    'requested_by_id' => $so->requested_by_id,
                    'requested_by_name' => $so->requestedBy->name ?? 'Unknown',
                    'status' => $so->status,
                    'created_at' => $so->created_at->format('Y-m-d H:i:s'),
                ];
            })
        ];
        
        return response()->json($debug);
    }
}
