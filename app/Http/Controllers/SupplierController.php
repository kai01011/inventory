<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use App\Http\Requests\StoreSupplierRequest;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::all();
        
        return Inertia::render('Suppliers', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(StoreSupplierRequest $request)
    {
        // Only admins can create suppliers
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can create suppliers.');
        }
        
        Supplier::create($request->validated());
        
        return redirect('/suppliers');
    }

    public function update(StoreSupplierRequest $request, $id)
    {
        // Only admins can update suppliers
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can update suppliers.');
        }
        
        $supplier = Supplier::findOrFail($id);
        $supplier->update($request->validated());

        return redirect('/suppliers');
    }

    public function destroy($id)
    {
        // Only admins can delete suppliers
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can delete suppliers.');
        }
        
        $supplier = Supplier::findOrFail($id);
        $supplier->delete(); // soft delete

        return redirect('/suppliers');
    }
}
