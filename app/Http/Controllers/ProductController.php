<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Http\Requests\StoreProductRequest;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'supplier'])->get();
        $categories = Category::all();
        $suppliers = Supplier::all();
        
        return Inertia::render('Products', [
            'products' => $products,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        // Only admins can create products
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can create products.');
        }
        
        Product::create($request->validated());
        
        return redirect('/products');
    }

    public function update(StoreProductRequest $request, $id)
    {
        // Only admins can update products
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can update products.');
        }
        
        $product = Product::findOrFail($id);
        $product->update($request->validated());

        return redirect('/products');
    }

    public function destroy($id)
    {
        // Only admins can delete products
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can delete products.');
        }
        
        $product = Product::findOrFail($id);
        $product->delete();
        
        return redirect('/products');
    }
}
