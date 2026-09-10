<?php

namespace App\Services;

use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\Product;
use App\Models\StockInItem;

class ApprovalService
{
    /**
     * Approve a stock in request
     * This will:
     * 1. Update the stock in request status to 'approved'
     * 2. Create/update products in the products table
     * 3. Mark it as completed
     */
    public static function approveStockInRequest($stockInId, $userId): bool
    {
        $stockIn = StockIn::with(['items', 'requestedBy'])->findOrFail($stockInId);
        $admin = \App\Models\User::find($userId);

        // Start transaction
        \DB::beginTransaction();

        try {
            // Update stock in status and mark as approved
            $stockIn->update([
                'status' => 'approved',
                'approved_by_id' => $userId,
                'approved_at' => now(),
            ]);

            // Process each item and create/update products
            foreach ($stockIn->items as $item) {
                self::processStockInItem($item);
            }

            // Log to history
            \App\Services\HistoryService::logStockInApproval($stockIn, 'approved', $userId);

            // Notify the user who requested this stock in
            \App\Services\NotificationService::notifyStockInApproval($stockIn, $admin->name);

            \DB::commit();
            return true;
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    /**
     * Process a single stock in item
     * Creates or updates product and adds to inventory
     */
    private static function processStockInItem(StockInItem $item): void
    {
        $product = Product::find($item->product_id);

        if (!$product && $item->product_name) {
            // First, check if a product with the same serial number exists
            // Serial number is unique in the database, so this is the primary check
            $existingProduct = null;
            
            if ($item->serial_no) {
                $existingProduct = Product::where('serial_no', $item->serial_no)->first();
            }
            
            // If no serial number match, check by barcode (also unique)
            if (!$existingProduct && $item->barcode) {
                $existingProduct = Product::where('barcode', $item->barcode)->first();
            }

            if ($existingProduct) {
                // Product exists - just update quantity and optionally update other fields
                $existingProduct->update([
                    'price' => $item->unit_price,
                    'quantity' => $existingProduct->quantity + $item->stock_in_quantity,
                    'updated_at' => now(),
                ]);
                
                // Link the stock in item to this existing product
                $item->update([
                    'product_id' => $existingProduct->id,
                ]);
            } else {
                // Create new product - no duplicate exists
                $productData = [
                    'product_name' => $item->product_name,
                    'category_id' => $item->category_id,  // Already a name
                    'supplier_id' => $item->supplier_id,   // Already a name
                    'price' => $item->unit_price,
                    'barcode' => $item->barcode,
                    'unit' => $item->unit,
                    'serial_no' => $item->serial_no,
                    'warranty_date' => $item->warranty_date,
                    'quantity' => $item->stock_in_quantity,
                ];
                
                $product = Product::create($productData);

                // Update the stock in item to link to the newly created product
                $item->update([
                    'product_id' => $product->id,
                ]);
            }
        } elseif ($product) {
            // Product exists via product_id - update price and increment quantity
            $product->update([
                'price' => $item->unit_price,
                'category_id' => $item->category_id,
                'supplier_id' => $item->supplier_id,
                'barcode' => $item->barcode,
                'unit' => $item->unit,
                'serial_no' => $item->serial_no,
                'warranty_date' => $item->warranty_date,
                'quantity' => $product->quantity + $item->stock_in_quantity,
                'updated_at' => now(),
            ]);
        }

        // Log the stock addition to history if needed
        // This would be used to track inventory movements
    }

    /**
     * Reject a stock in request
     */
    public static function rejectStockInRequest($stockInId, $userId, $reason = null): bool
    {
        $stockIn = StockIn::with('requestedBy')->findOrFail($stockInId);
        $admin = \App\Models\User::find($userId);

        $stockIn->update([
            'status' => 'rejected',
            'approved_by_id' => $userId,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        // Log to history
        \App\Services\HistoryService::logStockInApproval($stockIn, 'rejected', $userId, $reason);

        // Notify the user who requested this stock in
        \App\Services\NotificationService::notifyStockInRejection($stockIn, $admin->name, $reason);

        return true;
    }

    /**
     * Approve a stock out request and decrement product quantities
     */
    public static function approveStockOutRequest($stockOutId, $userId): bool
    {
        $stockOut = StockOut::with(['items', 'requestedBy', 'customer'])->findOrFail($stockOutId);
        $admin = \App\Models\User::find($userId);

        // Start transaction
        \DB::beginTransaction();

        try {
            // Update stock out status and mark as approved
            $stockOut->update([
                'status' => 'approved',
                'approved_by_id' => $userId,
                'approved_at' => now(),
                'updated_at' => now(),
            ]);

            // Process each item and decrement product quantity
            foreach ($stockOut->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    // Decrement product quantity
                    $product->update([
                        'quantity' => max(0, $product->quantity - $item->stock_out_quantity),
                        'updated_at' => now(),
                    ]);

                    // Also decrement stock_in_items quantity
                    $stockInItems = StockInItem::where('product_id', $item->product_id)
                        ->orderBy('created_at', 'desc')
                        ->get();

                    $remainingQty = $item->stock_out_quantity;

                    foreach ($stockInItems as $stockInItem) {
                        if ($remainingQty <= 0) {
                            break;
                        }

                        $currentQty = $stockInItem->stock_in_quantity;
                        $decreaseBy = min($remainingQty, $currentQty);

                        $stockInItem->update([
                            'stock_in_quantity' => max(0, $currentQty - $decreaseBy),
                            'updated_at' => now(),
                        ]);

                        $remainingQty -= $decreaseBy;
                    }
                }
            }

            // Log to history
            \App\Services\HistoryService::logStockOutApproval($stockOut, 'approved', $userId);

            // Notify the user who requested this stock out
            \App\Services\NotificationService::notifyStockOutApproval($stockOut, $admin->name);

            \DB::commit();
            return true;
        } catch (\Exception $e) {
            \DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reject a stock out request
     */
    public static function rejectStockOutRequest($stockOutId, $userId, $reason = null): bool
    {
        $stockOut = StockOut::with(['requestedBy', 'customer'])->findOrFail($stockOutId);
        $admin = \App\Models\User::find($userId);

        $stockOut->update([
            'status' => 'rejected',
            'approved_by_id' => $userId,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        // Log to history
        \App\Services\HistoryService::logStockOutApproval($stockOut, 'rejected', $userId, $reason);

        // Notify the user who requested this stock out
        \App\Services\NotificationService::notifyStockOutRejection($stockOut, $admin->name, $reason);

        return true;
    }
}
