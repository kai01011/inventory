<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== MIGRATION SAFETY CHECK ===\n\n";

// Check if serial_no is nullable
$database = config('database.connections.mysql.database');
$columns = DB::select("
    SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'serial_no'
", [$database]);

echo "1. serial_no column check:\n";
if (count($columns) > 0) {
    $col = $columns[0];
    echo "   IS_NULLABLE: {$col->IS_NULLABLE}\n";
    echo "   TYPE: {$col->COLUMN_TYPE}\n";
    echo "   DEFAULT: {$col->COLUMN_DEFAULT}\n";
    
    if ($col->IS_NULLABLE === 'YES') {
        echo "   ✓ SAFE TO REMOVE (migration 2026_09_16_120000 is active)\n";
    } else {
        echo "   ✗ NOT SAFE - serial_no is NOT nullable yet\n";
    }
} else {
    echo "   ✗ Column not found\n";
}

// Check if performance indexes exist
echo "\n2. Performance indexes check:\n";
$indexes = DB::select("
    SELECT INDEX_NAME, TABLE_NAME, COLUMN_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = ? AND INDEX_NAME LIKE 'stock_in_%_index'
    LIMIT 5
", [$database]);

if (count($indexes) > 0) {
    echo "   Found " . count($indexes) . " indexes\n";
    foreach ($indexes as $idx) {
        echo "     - {$idx->TABLE_NAME}.{$idx->COLUMN_NAME}\n";
    }
    echo "   ✓ Performance indexes are ACTIVE in database\n";
    echo "   ✗ NOT SAFE TO REMOVE (would break indexing)\n";
} else {
    echo "   No indexes found\n";
    echo "   ✓ SAFE TO REMOVE (migration 2026_09_16_125000 didn't apply)\n";
}

// Check migration record
echo "\n3. Migration execution record:\n";
$executed = DB::table('migrations')
    ->whereIn('migration', [
        '2026_09_16_120000_make_serial_no_nullable',
        '2026_09_16_125000_add_performance_indexes'
    ])
    ->get();

foreach ($executed as $m) {
    echo "   - {$m->migration}: Batch {$m->batch}\n";
}

echo "\n=== RECOMMENDATION ===\n";
if (count($indexes) > 0) {
    echo "❌ DO NOT REMOVE 2026_09_16_125000_add_performance_indexes\n";
    echo "   Reason: Indexes are active in database. Removing migration file\n";
    echo "   while indexes exist causes tracking mismatch.\n";
} else {
    echo "✓ SAFE TO REMOVE both migrations (haven't been applied).\n";
}

echo "\n";
