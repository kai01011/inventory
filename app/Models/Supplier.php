<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = [
        'supplier_name',
    ];

    /**
     * Get all products from this supplier
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
