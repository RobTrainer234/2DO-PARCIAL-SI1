<?php

require_once 'bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Materia' ORDER BY ordinal_position");

echo "=== ESTRUCTURA DE TABLA MATERIA ===\n\n";
foreach($columns as $col) {
    echo $col->column_name . " (" . $col->data_type . ")\n";
}
echo "\n=== TOTAL COLUMNAS: " . count($columns) . " ===\n";
