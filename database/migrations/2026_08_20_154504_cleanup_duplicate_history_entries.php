<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clean up duplicate history entries for stock_in
        $duplicateStockIns = DB::table('history')
            ->select('stock_in_id')
            ->whereNotNull('stock_in_id')
            ->whereNotNull('action_type')
            ->groupBy('stock_in_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('stock_in_id');

        foreach ($duplicateStockIns as $stockInId) {
            // Get all history entries for this stock_in_id
            $entries = DB::table('history')
                ->where('stock_in_id', $stockInId)
                ->where('action_type', 'stock_in')
                ->orderBy('created_at', 'desc')
                ->get();

            if ($entries->count() > 1) {
                // Keep the latest entry, delete the rest
                $latestEntry = $entries->first();
                $entriesToDelete = $entries->slice(1);

                foreach ($entriesToDelete as $entry) {
                    DB::table('history')->where('id', $entry->id)->delete();
                }
            }
        }

        // Clean up duplicate history entries for stock_out
        $duplicateStockOuts = DB::table('history')
            ->select('stock_out_id')
            ->whereNotNull('stock_out_id')
            ->whereNotNull('action_type')
            ->groupBy('stock_out_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('stock_out_id');

        foreach ($duplicateStockOuts as $stockOutId) {
            // Get all history entries for this stock_out_id
            $entries = DB::table('history')
                ->where('stock_out_id', $stockOutId)
                ->where('action_type', 'stock_out')
                ->orderBy('created_at', 'desc')
                ->get();

            if ($entries->count() > 1) {
                // Keep the latest entry, delete the rest
                $latestEntry = $entries->first();
                $entriesToDelete = $entries->slice(1);

                foreach ($entriesToDelete as $entry) {
                    DB::table('history')->where('id', $entry->id)->delete();
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reverse this migration as we've deleted duplicate data
    }
};