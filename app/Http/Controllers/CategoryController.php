<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Requests\StoreCategoryRequest;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        
        return Inertia::render('Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        // Only admins can create categories
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can create categories.');
        }
        
        Category::create($request->validated());
        
        return redirect('/categories');
    }

    public function update(StoreCategoryRequest $request, $id)
    {
        // Only admins can update categories
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can update categories.');
        }
        
        $category = Category::findOrFail($id);
        $category->update($request->validated());

        return redirect('/categories');
    }

    public function destroy($id)
    {
        // Only admins can delete categories
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can delete categories.');
        }
        
        $category = Category::findOrFail($id);
        $category->delete();
        
        return redirect('/categories');
    }
}
