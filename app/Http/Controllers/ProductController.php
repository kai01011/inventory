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
        Product::create($request->validated());
        
        return redirect('/products');
    }

    public function update(StoreProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->validated());

        return redirect('/products');
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        
        return redirect('/products');
    }
}
