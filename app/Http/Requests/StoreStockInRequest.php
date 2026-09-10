<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStockInRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'remarks' => 'nullable|string',
            'status' => 'required|in:pending,approved,rejected,completed',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string',
            'items.*.category_id' => 'required|string',
            'items.*.supplier_id' => 'required|string',
            'items.*.price' => 'nullable|numeric|min:0',
            'items.*.barcode' => 'nullable|string',
            'items.*.unit' => 'nullable|string',
            'items.*.serial_no' => 'nullable|string',
            'items.*.warranty_date' => 'nullable|date',
            'items.*.stock_in_quantity' => 'required|numeric|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Please add at least one product to request.',
            'items.min' => 'Please add at least one product to request.',
            'items.*.stock_in_quantity.required' => 'Quantity is required for each item.',
            'items.*.stock_in_quantity.numeric' => 'Quantity must be a number.',
            'items.*.stock_in_quantity.min' => 'Quantity must be at least 1.',
        ];
    }
}
