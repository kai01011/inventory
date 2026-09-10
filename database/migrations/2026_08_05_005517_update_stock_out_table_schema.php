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
        Schema::table('stock_out', function (Blueprint $table) {
            // Drop the foreign key constraint from delivered_to_id
            $table->dropForeign(['delivered_to_id']);
            
            // Change delivered_to_id to string to store customer name or ID
            $table->string('delivered_to_id')->change();
            
            // Add remarks field
            $table->text('remarks')->nullable()->after('business_style');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_out', function (Blueprint $table) {
            $table->dropColumn('remarks');
            
            // Revert delivered_to_id back to unsignedBigInteger
            $table->unsignedBigInteger('delivered_to_id')->change();
            
            // Re-add foreign key
            $table->foreign('delivered_to_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }
};
