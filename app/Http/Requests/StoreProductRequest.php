<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
        $productId = $this->route('id');

        return [
            'product_name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'price' => 'nullable|numeric|min:0',
            'barcode' => 'nullable|string|max:255|unique:products,barcode,' . $productId,
            'unit' => 'required|string|max:255',
            'serial_no' => 'required|string|max:255|unique:products,serial_no,' . $productId,
            'warranty_date' => 'nullable|date',
        ];
    }
}
