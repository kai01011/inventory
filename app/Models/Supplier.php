<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use SoftDeletes;

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
