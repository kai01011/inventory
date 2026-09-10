<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_in_items', function (Blueprint $table) {
            // Add product detail columns to store before approval
            $table->string('category_id')->nullable()->after('product_name');
            $table->string('supplier_id')->nullable()->after('category_id');
            $table->decimal('price', 10, 2)->nullable()->after('supplier_id');
            $table->string('barcode')->nullable()->after('price');
            $table->string('unit')->nullable()->after('barcode');
            $table->string('serial_no')->nullable()->after('unit');
            $table->date('warranty_date')->nullable()->after('serial_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_in_items', function (Blueprint $table) {
            $table->dropColumn(['category_id', 'supplier_id', 'price', 'barcode', 'unit', 'serial_no', 'warranty_date']);
        });
    }
};
