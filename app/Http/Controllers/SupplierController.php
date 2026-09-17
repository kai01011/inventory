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
        Supplier::create($request->validated());
        
        return redirect('/suppliers');
    }

    public function update(StoreSupplierRequest $request, $id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update($request->validated());

        return redirect('/suppliers');
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete(); // soft delete

        return redirect('/suppliers');
    }
}
