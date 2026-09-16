<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Note: The original table creation already includes 'rejected' in the enum.
     * This migration is idempotent—it ensures the status column maintains
     * the full set of allowed values including rejected.
     */
    public function up(): void
    {
        Schema::table('stock_out', function (Blueprint $table) {
            // Ensure status enum includes all values: pending, approved, rejected, shipped, delivered
            $table->enum('status', ['pending', 'approved', 'rejected', 'shipped', 'delivered'])
                ->default('pending')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     * 
     * This rollback is protected: it will throw an exception if any stock_out records
     * have status='rejected', preventing data loss and schema inconsistency.
     */
    public function down(): void
    {
        // Check if any records have 'rejected' status before attempting rollback
        $rejectedCount = DB::table('stock_out')
            ->where('status', 'rejected')
            ->count();

        if ($rejectedCount > 0) {
            throw new \RuntimeException(
                sprintf(
                    'Cannot rollback migration: %d stock_out record(s) have status="rejected". '
                    . 'Please resolve these records before rolling back. '
                    . 'Options: (1) manually update rejected records to another status, or (2) delete them. '
                    . 'This prevents data loss and ensures schema consistency.',
                    $rejectedCount
                )
            );
        }

        // Only revert if no rejected records exist
        // Revert to the previous allowed enum values before this migration
        Schema::table('stock_out', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'shipped', 'delivered'])
                ->default('pending')
                ->change();
        });
    }
};
