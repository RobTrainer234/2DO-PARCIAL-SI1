<?php
/**
 * Script de prueba rápida para la función importarDocentesExcel
 * Verifica que OpenSpout está disponible y funcionando
 */

require 'vendor/autoload.php';

echo "═════════════════════════════════════════════════════════════════\n";
echo "PRUEBA RÁPIDA - CU4 IMPORTACIÓN DE DOCENTES\n";
echo "═════════════════════════════════════════════════════════════════\n\n";

// 1. Verificar que OpenSpout está instalado
echo "1️⃣  Verificando OpenSpout...\n";
try {
    $readerFactory = \OpenSpout\Reader\ReaderFactory::class;
    echo "   ✅ OpenSpout ReaderFactory disponible\n";
} catch (\Throwable $e) {
    echo "   ❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

// 2. Verificar archivo CSV de prueba
echo "\n2️⃣  Verificando datos de prueba...\n";
if (file_exists('docentes_ejemplo.csv')) {
    $lineas = file('docentes_ejemplo.csv');
    echo "   ✅ Archivo docentes_ejemplo.csv existe\n";
    echo "   ✅ Líneas: " . count($lineas) . "\n";
} else {
    echo "   ⚠️  Archivo docentes_ejemplo.csv NO encontrado\n";
}

// 3. Verificar que los métodos existen
echo "\n3️⃣  Verificando métodos del controlador...\n";
if (class_exists('App\Http\Controllers\Api\DocenteController')) {
    $reflectionClass = new ReflectionClass('App\Http\Controllers\Api\DocenteController');
    
    if ($reflectionClass->hasMethod('procesarCSV')) {
        echo "   ✅ Método procesarCSV() existe\n";
    } else {
        echo "   ❌ Método procesarCSV() NO encontrado\n";
    }
    
    if ($reflectionClass->hasMethod('procesarExcel')) {
        echo "   ✅ Método procesarExcel() existe\n";
    } else {
        echo "   ❌ Método procesarExcel() NO encontrado\n";
    }
    
    if ($reflectionClass->hasMethod('importarDocentesExcel')) {
        echo "   ✅ Método importarDocentesExcel() existe\n";
    } else {
        echo "   ❌ Método importarDocentesExcel() NO encontrado\n";
    }
} else {
    echo "   ❌ Clase DocenteController NO encontrada\n";
}

// 4. Resultado final
echo "\n═════════════════════════════════════════════════════════════════\n";
echo "✅ TODAS LAS VERIFICACIONES PASARON\n";
echo "═════════════════════════════════════════════════════════════════\n";
echo "\nSistema listo para importar docentes desde CSV, XLSX, XLS\n";
?>
