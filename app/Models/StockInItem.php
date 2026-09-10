<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockInItem extends Model
{
    protected $table = 'stock_in_items';

    protected $fillable = [
        'stock_in_id',
        'product_id',
        'stock_in_quantity',
        'unit_price',
        'category_id',
        'supplier_id',
        'product_name',
        'barcode',
        'unit',
        'serial_no',
        'warranty_date',
    ];

    /**
     * Get the stock in this item belongs to
     */
    public function stockIn(): BelongsTo
    {
        return $this->belongsTo(StockIn::class, 'stock_in_id');
    }

    /**
     * Get the product for this item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Get the category for this item
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get the supplier for this item
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
}
