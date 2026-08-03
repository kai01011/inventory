<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockOut extends Model
{
    protected $table = 'stock_out';

    protected $fillable = [
        'requested_by_id',
        'delivered_to_id',
        'delivery_no',
        'address',
        'tin',
        'status',
        'business_style',
    ];

    /**
     * Get the user who requested this stock out
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_id');
    }

    /**
     * Get the customer this delivery is for
     */
    public function deliveredTo(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'delivered_to_id');
    }

    /**
     * Get all items in this stock out delivery
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockOutItem::class);
    }

    /**
     * Get history records for this stock out
     */
    public function histories(): HasMany
    {
        return $this->hasMany(History::class);
    }
}
