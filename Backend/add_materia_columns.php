<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    // Agregar columnas si no existen
    if (Schema::hasTable('Materia')) {
        $columns = Schema::getColumnListing('Materia');
        
        if (!in_array('semestre', $columns)) {
            DB::statement('ALTER TABLE "Materia" ADD COLUMN semestre INTEGER');
            echo "✓ Agregada columna: semestre\n";
        } else {
            echo "✓ Columna semestre ya existe\n";
        }
        
        if (!in_array('horas_teoricas', $columns)) {
            DB::statement('ALTER TABLE "Materia" ADD COLUMN horas_teoricas INTEGER DEFAULT 3');
            echo "✓ Agregada columna: horas_teoricas\n";
        } else {
            echo "✓ Columna horas_teoricas ya existe\n";
        }
        
        if (!in_array('horas_practicas', $columns)) {
            DB::statement('ALTER TABLE "Materia" ADD COLUMN horas_practicas INTEGER DEFAULT 2');
            echo "✓ Agregada columna: horas_practicas\n";
        } else {
            echo "✓ Columna horas_practicas ya existe\n";
        }
        
        if (!in_array('creditos', $columns)) {
            DB::statement('ALTER TABLE "Materia" ADD COLUMN creditos INTEGER DEFAULT 3');
            echo "✓ Agregada columna: creditos\n";
        } else {
            echo "✓ Columna creditos ya existe\n";
        }
        
        echo "\n✅ Tabla Materia actualizada correctamente\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
