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
        Category::create($request->validated());
        
        return redirect('/categories');
    }

    public function update(StoreCategoryRequest $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->validated());

        return redirect('/categories');
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();
        
        return redirect('/categories');
    }
}
