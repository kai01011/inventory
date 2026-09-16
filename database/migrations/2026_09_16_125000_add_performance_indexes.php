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
     * Add indexes on frequently queried columns for performance optimization.
     * Idempotent: Checks for existing indexes before creating.
     */
    public function up(): void
    {
        // Stock In status queries
        if (!$this->indexExists('stock_in', 'status')) {
            Schema::table('stock_in', function (Blueprint $table) {
                $table->index('status');
            });
        }
        if (!$this->indexExists('stock_in', 'requested_by_id')) {
            Schema::table('stock_in', function (Blueprint $table) {
                $table->index('requested_by_id');
            });
        }
        if (!$this->indexExists('stock_in', 'created_at')) {
            Schema::table('stock_in', function (Blueprint $table) {
                $table->index('created_at');
            });
        }

        // Stock Out status queries
        if (!$this->indexExists('stock_out', 'status')) {
            Schema::table('stock_out', function (Blueprint $table) {
                $table->index('status');
            });
        }
        if (!$this->indexExists('stock_out', 'requested_by_id')) {
            Schema::table('stock_out', function (Blueprint $table) {
                $table->index('requested_by_id');
            });
        }
        if (!$this->indexExists('stock_out', 'delivered_to_id')) {
            Schema::table('stock_out', function (Blueprint $table) {
                $table->index('delivered_to_id');
            });
        }
        if (!$this->indexExists('stock_out', 'created_at')) {
            Schema::table('stock_out', function (Blueprint $table) {
                $table->index('created_at');
            });
        }

        // Product queries
        if (!$this->indexExists('products', 'category_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->index('category_id');
            });
        }
        if (!$this->indexExists('products', 'supplier_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->index('supplier_id');
            });
        }
        if (!$this->indexExists('products', 'deleted_at')) {
            Schema::table('products', function (Blueprint $table) {
                $table->index('deleted_at');
            });
        }

        // History queries
        if (!$this->indexExists('history', 'created_at')) {
            Schema::table('history', function (Blueprint $table) {
                $table->index('created_at');
            });
        }
        if (!$this->indexExists('history', 'user_id')) {
            Schema::table('history', function (Blueprint $table) {
                $table->index('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes if they exist
        $this->dropIndexIfExists('stock_in', 'status');
        $this->dropIndexIfExists('stock_in', 'requested_by_id');
        $this->dropIndexIfExists('stock_in', 'created_at');
        $this->dropIndexIfExists('stock_out', 'status');
        $this->dropIndexIfExists('stock_out', 'requested_by_id');
        $this->dropIndexIfExists('stock_out', 'delivered_to_id');
        $this->dropIndexIfExists('stock_out', 'created_at');
        $this->dropIndexIfExists('products', 'category_id');
        $this->dropIndexIfExists('products', 'supplier_id');
        $this->dropIndexIfExists('products', 'deleted_at');
        $this->dropIndexIfExists('history', 'created_at');
        $this->dropIndexIfExists('history', 'user_id');
    }

    /**
     * Check if an index exists
     */
    private function indexExists($table, $column): bool
    {
        $database = config('database.connections.mysql.database');
        $indexes = DB::select("
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
        ", [$database, $table, $column]);
        
        return count($indexes) > 0;
    }

    /**
     * Drop index if it exists
     */
    private function dropIndexIfExists($table, $column): void
    {
        if ($this->indexExists($table, $column)) {
            $indexName = $table . '_' . $column . '_index';
            DB::statement("ALTER TABLE $table DROP INDEX $indexName");
        }
    }
};

