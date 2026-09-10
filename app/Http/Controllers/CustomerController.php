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
        Customer::create($request->validated());
        
        return redirect('/customers');
    }

    public function update(StoreCustomerRequest $request, $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->validated());

        return redirect('/customers');
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return redirect('/customers');
    }
}
