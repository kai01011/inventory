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
        Schema::create('stock_out', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requested_by_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('delivered_to_id')->constrained('customers')->onDelete('cascade');
            $table->string('delivery_no')->unique();
            $table->string('address');
            $table->string('tin')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'shipped', 'delivered'])->default('pending');
            $table->string('business_style')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_out');
    }
};
