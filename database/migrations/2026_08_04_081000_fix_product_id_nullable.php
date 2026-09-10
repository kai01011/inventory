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
        // First, get the foreign key name dynamically
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'stock_in_items' 
            AND COLUMN_NAME = 'product_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        if (!empty($foreignKeys)) {
            $constraintName = $foreignKeys[0]->CONSTRAINT_NAME;
            DB::statement("ALTER TABLE stock_in_items DROP FOREIGN KEY {$constraintName}");
        }

        // Now modify the column to be nullable
        DB::statement('ALTER TABLE stock_in_items MODIFY COLUMN product_id BIGINT UNSIGNED NULL');

        // Re-add the foreign key
        DB::statement('
            ALTER TABLE stock_in_items 
            ADD CONSTRAINT stock_in_items_product_id_foreign 
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Get the foreign key name
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_NAME = 'stock_in_items' 
            AND COLUMN_NAME = 'product_id'
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        if (!empty($foreignKeys)) {
            $constraintName = $foreignKeys[0]->CONSTRAINT_NAME;
            DB::statement("ALTER TABLE stock_in_items DROP FOREIGN KEY {$constraintName}");
        }

        // Revert to NOT NULL
        DB::statement('ALTER TABLE stock_in_items MODIFY COLUMN product_id BIGINT UNSIGNED NOT NULL');

        // Re-add the foreign key
        DB::statement('
            ALTER TABLE stock_in_items 
            ADD CONSTRAINT stock_in_items_product_id_foreign 
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        ');
    }
};
