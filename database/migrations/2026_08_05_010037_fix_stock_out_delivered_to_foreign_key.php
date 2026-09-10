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
            // Change delivered_to_id back to unsignedBigInteger for foreign key
            $table->unsignedBigInteger('delivered_to_id')->change();
            
            // Add foreign key constraint
            $table->foreign('delivered_to_id')->references('id')->on('customers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_out', function (Blueprint $table) {
            // Drop foreign key
            $table->dropForeign(['delivered_to_id']);
            
            // Change back to string
            $table->string('delivered_to_id')->change();
        });
    }
};
