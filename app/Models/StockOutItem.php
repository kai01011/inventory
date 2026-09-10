<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOutItem extends Model
{
    protected $table = 'stock_out_items';

    protected $fillable = [
        'stock_out_id',
        'product_id',
        'stock_out_quantity',
        'unit_price',
    ];

    /**
     * Get the stock out this item belongs to
     */
    public function stockOut(): BelongsTo
    {
        return $this->belongsTo(StockOut::class, 'stock_out_id');
    }

    /**
     * Get the product for this item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
