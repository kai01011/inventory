<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customer;
use App\Models\StockIn;
use App\Models\StockInItem;
use App\Models\StockOut;
use App\Models\StockOutItem;
use App\Models\History;
use Inertia\Inertia;

class TableViewController extends Controller
{
    private $tables = [
        'users' => User::class,
        'roles' => Role::class,
        'suppliers' => Supplier::class,
        'categories' => Category::class,
        'products' => Product::class,
        'customers' => Customer::class,
        'stock-in' => StockIn::class,
        'stock-in-items' => StockInItem::class,
        'stock-out' => StockOut::class,
        'stock-out-items' => StockOutItem::class,
        'history' => History::class,
    ];

    public function show($table)
    {
        // The table parameter comes with hyphens from the URL, use it as-is
        if (!isset($this->tables[$table])) {
            abort(404, 'Table not found');
        }

        $modelClass = $this->tables[$table];
        $data = $modelClass::all()->toArray();
        
        // Convert table name to proper title
        $title = ucwords(str_replace('-', ' ', $table));

        return Inertia::render('Tables/TableViewer', [
            'table' => $table,
            'title' => $title,
            'data' => $data,
        ]);
    }
}
