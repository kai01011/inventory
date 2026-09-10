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
        'approved_by_id',
        'remarks',
        'status',
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
     * Get the user who requested this stock in
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_id');
    }

    /**
     * Alias for requestedBy relationship
     */
    public function user(): BelongsTo
    {
        return $this->requestedBy();
    }

    /**
     * Get the user who approved this stock in
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
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
