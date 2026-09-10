<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class History extends Model
{
    protected $table = 'history';

    protected $fillable = [
        'stock_in_id',
        'stock_out_id',
        'action_type',
        'status',
        'user_id',
        'description',
    ];

    /**
     * Get the stock in record for this history entry
     */
    public function stockIn(): BelongsTo
    {
        return $this->belongsTo(StockIn::class, 'stock_in_id');
    }

    /**
     * Get the stock out record for this history entry
     */
    public function stockOut(): BelongsTo
    {
        return $this->belongsTo(StockOut::class, 'stock_out_id');
    }

    /**
     * Get the user who performed this action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
