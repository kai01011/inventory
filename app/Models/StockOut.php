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
        'remarks',
        'status',
        'business_style',
        'approved_by_id',
        'approved_at',
        'rejection_reason',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
     * Alias for deliveredTo relationship
     */
    public function customer(): BelongsTo
    {
        return $this->deliveredTo();
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

    /**
     * Get the user who approved this stock out
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }
}
