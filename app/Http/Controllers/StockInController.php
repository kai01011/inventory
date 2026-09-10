<?php

namespace App\Http\Controllers;

use App\Models\StockIn;
use App\Models\StockInItem;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Http\Requests\StoreStockInRequest;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockInController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->load('role');
        
        // Filter stock ins based on user role and load all necessary relationships
        if ($user->role->role_name === 'Admin') {
            // Admin sees all stock ins
            $stockIns = StockIn::with([
                'items.product',
                'requestedBy', // This is the 'user' relationship the frontend expects
                'approvedBy'
            ])
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('updated_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
        } else {
            // Staff sees only their own stock ins
            $stockIns = StockIn::where('requested_by_id', $user->id)
                ->with([
                    'items.product',
                    'requestedBy', // This is the 'user' relationship the frontend expects
                    'approvedBy'
                ])
                ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
                ->orderBy('updated_at', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        // Transform the data to include user relationship alias
        $stockIns = $stockIns->map(function ($stockIn) {
            $stockIn->user = $stockIn->requestedBy; // Frontend expects 'user' property
            return $stockIn;
        });
        
        $products = Product::with('category', 'supplier')->where('deleted_at', null)->get();
        $categories = Category::all();
        $suppliers = Supplier::all();
        
        return Inertia::render('StockIn', [
            'stockIns' => $stockIns,
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
            'isAdmin' => $user->role->role_name === 'Admin',
            'userRole' => $user->role->role_name,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(StoreStockInRequest $request)
    {
        $validated = $request->validated();

        // Create the stock in request
        $stockIn = StockIn::create([
            'requested_by_id' => auth()->id(),
            'remarks' => $validated['remarks'],
            'status' => $validated['status'],
        ]);

        // Create stock in items - store all product details but don't create product yet
        foreach ($validated['items'] as $item) {
            // Create or get category
            $categoryName = $item['category_id'];
            $category = Category::where('category_name', $categoryName)->first();
            if (!$category) {
                $category = Category::create(['category_name' => $categoryName]);
            }

            // Create or get supplier
            $supplierName = $item['supplier_id'];
            $supplier = Supplier::where('supplier_name', $supplierName)->first();
            if (!$supplier) {
                $supplier = Supplier::create(['supplier_name' => $supplierName]);
            }

            StockInItem::create([
                'stock_in_id' => $stockIn->id,
                'product_id' => null,
                'product_name' => $item['product_name'],
                'category_id' => $categoryName,
                'supplier_id' => $supplierName,
                'price' => $item['price'] ?? 0,
                'barcode' => $item['barcode'] ?? null,
                'unit' => $item['unit'] ?? null,
                'serial_no' => $item['serial_no'] ?? null,
                'warranty_date' => $item['warranty_date'] ?? null,
                'stock_in_quantity' => $item['stock_in_quantity'],
                'unit_price' => $item['price'] ?? 0,
            ]);
        }

        // Log to history - removed pending logging as history should only show completed actions
        // \App\Services\HistoryService::logStockInRequest($stockIn, 'pending', auth()->id());

        // Notify admins of the new stock in request
        NotificationService::notifyStockInRequest(
            $stockIn->id,
            auth()->user()->name,
            \count($validated['items'])
        );
        
        // Return JSON for AJAX requests, redirect for regular requests
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Stock in request created successfully', 'stock_in_id' => $stockIn->id], 201);
        }
        
        return redirect('/stock-in');
    }

    public function destroy($id)
    {
        $stockIn = StockIn::findOrFail($id);
        // Delete all items first
        $stockIn->items()->delete();
        // Then delete the stock in request
        $stockIn->delete();
        
        return redirect('/stock-in');
    }
}

