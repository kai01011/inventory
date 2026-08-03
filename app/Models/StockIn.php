<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockIn extends Model
{
    protected $table = 'stock_in';

    protected $fillable = [
        'requested_by_id',
        'remarks',
        'status',
    ];

    /**
     * Get the user who requested this stock in
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_id');
    }

    /**
     * Get all items in this stock in request
     */
    public function items(): HasMany
    {
        return $this->hasMany(StockInItem::class);
    }

    /**
     * Get history records for this stock in
     */
    public function histories(): HasMany
    {
        return $this->hasMany(History::class);
    }
}
