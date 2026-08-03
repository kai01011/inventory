<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'supplier_id',
        'product_name',
        'price',
        'barcode',
        'unit',
        'serial_no',
        'warranty_date',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'warranty_date' => 'date',
    ];

    protected $dates = [
        'deleted_at',
    ];

    /**
     * Get the category this product belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the supplier of this product
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * Get all stock in items for this product
     */
    public function stockInItems(): HasMany
    {
        return $this->hasMany(StockInItem::class);
    }

    /**
     * Get all stock out items for this product
     */
    public function stockOutItems(): HasMany
    {
        return $this->hasMany(StockOutItem::class);
    }

    /**
     * Get all cart items for this product
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }
}
