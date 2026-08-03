<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $table = 'cart_items';

    protected $fillable = [
        'customer_id',
        'product_id',
        'cart_quantity',
    ];

    /**
     * Get the customer this cart belongs to
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the product in this cart item
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
