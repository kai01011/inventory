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
        Schema::table('products', function (Blueprint $table) {
            // Drop existing foreign keys
            $table->dropForeign(['category_id']);
            $table->dropForeign(['supplier_id']);
        });

        Schema::table('products', function (Blueprint $table) {
            // Change columns to string/text to store names
            $table->string('category_id')->change();
            $table->string('supplier_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert back to unsignedBigInteger
            $table->unsignedBigInteger('category_id')->change();
            $table->unsignedBigInteger('supplier_id')->change();
        });

        Schema::table('products', function (Blueprint $table) {
            // Re-add foreign keys
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
        });
    }
};
