<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'customer_name',
    ];

    /**
     * Get all stock out deliveries for this customer
     */
    public function stockOuts(): HasMany
    {
        return $this->hasMany(StockOut::class, 'delivered_to_id');
    }
}

