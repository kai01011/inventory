<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Http\Requests\StoreCustomerRequest;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::all();
        
        return Inertia::render('Customers', [
            'customers' => $customers,
        ]);
    }

    public function store(StoreCustomerRequest $request)
    {
        // Only admins can create customers
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can create customers.');
        }
        
        Customer::create($request->validated());
        
        return redirect('/customers');
    }

    public function update(StoreCustomerRequest $request, $id)
    {
        // Only admins can update customers
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can update customers.');
        }
        
        $customer = Customer::findOrFail($id);
        $customer->update($request->validated());

        return redirect('/customers');
    }

    public function destroy($id)
    {
        // Only admins can delete customers
        if (auth()->user()->role->role_name !== 'Admin') {
            abort(403, 'Only administrators can delete customers.');
        }
        
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return redirect('/customers');
    }
}
