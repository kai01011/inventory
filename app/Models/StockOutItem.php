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

    protected $casts = [
        'unit_price' => 'decimal:2',
    ];

    /**
     * Get the stock out delivery this item belongs to
     */
    public function stockOut(): BelongsTo
    {
        return $this->belongsTo(StockOut::class);
    }

    /**
     * Get the product for this item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
