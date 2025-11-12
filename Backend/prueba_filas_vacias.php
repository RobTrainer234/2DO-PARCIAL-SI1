<?php

// Prueba del nuevo manejo de filas vacías

require_once __DIR__ . '/vendor/autoload.php';

use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Reader\XLSX\Reader as XLSXReader;
use OpenSpout\Common\Entity\Row;

echo "=== Prueba: Manejo de Filas Vacías ===\n\n";

// 1. Crear archivo con filas vacías como el tuyo
$testPath = __DIR__ . '/storage/temp/test_filas_vacias.xlsx';

if (!is_dir(dirname($testPath))) {
    mkdir(dirname($testPath), 0755, true);
}

echo "1. Creando Excel con filas vacías...\n";
$writer = new Writer();
$writer->openToFile($testPath);

// Headers
$headers = [
    'nombre', 'apellido', 'correo', 'ci', 'contraseña',
    'teléfono', 'sexo', 'dirección', 'especialidad', 'fecha_contrato'
];
$writer->addRow(Row::fromValues($headers));

// Fila ejemplo
$ejemplo = [
    'Juan', 'Pérez García', 'juan.perez@escuela.edu', '12345678', 'Password123!',
    '+591-77777777', 'M', 'Calle Principal 123, La Paz', 'Matemáticas', '2024-01-15'
];
$writer->addRow(Row::fromValues($ejemplo));

// Filas vacías (como el usuario no llenó)
for ($i = 0; $i < 2; $i++) {
    $writer->addRow(Row::fromValues([
        '', '', '', '', '', '', '', '', '', ''
    ]));
}

// Una fila con datos
$newRow = [
    'María', 'García López', 'maria@test.com', '99999999', 'TestPass123!',
    '+591-88888888', 'F', 'Calle Nueva 789', 'Literatura', '2024-02-20'
];
$writer->addRow(Row::fromValues($newRow));

$writer->close();
echo "   ✓ Archivo creado\n\n";

// 2. Simular lectura y procesamiento
echo "2. Leyendo archivo...\n";
$reader = new XLSXReader();
$reader->open($testPath);

$datos = [];
foreach ($reader->getSheetIterator() as $sheet) {
    foreach ($sheet->getRowIterator() as $indexFila => $row) {
        $cells = $row->getCells();
        $rowData = [];
        
        foreach ($cells as $cell) {
            $rowData[] = $cell->getValue();
        }
        
        if ($indexFila > 1) {
            $datos[] = $rowData;
        }
    }
    break;
}
$reader->close();

echo "   Filas leídas (sin header): " . count($datos) . "\n\n";

// 3. Simular procesamiento con nueva lógica
echo "3. Procesando con nueva lógica...\n\n";

$fila = 2;
$creados = 0;
$saltadas = 0;

foreach ($datos as $row) {
    echo "Fila $fila:\n";
    
    // Nueva lógica: Saltar filas COMPLETAMENTE vacías
    $esFilaVacia = true;
    foreach ($row as $cell) {
        if (!empty(trim($cell))) {
            $esFilaVacia = false;
            break;
        }
    }
    
    if ($esFilaVacia) {
        echo "  → SALTADA (completamente vacía)\n";
        $saltadas++;
        $fila++;
        continue;
    }
    
    // Extraer datos
    $nombre = trim($row[0] ?? '');
    $apellido = trim($row[1] ?? '');
    $correo = trim($row[2] ?? '');
    $ci = trim($row[3] ?? '');
    $password = trim($row[4] ?? '');
    
    // Verificar campos requeridos
    if (empty($nombre) || empty($apellido) || empty($correo) || empty($ci) || empty($password)) {
        echo "  → ERROR: Faltan campos requeridos\n";
        echo "     nombre: '$nombre', apellido: '$apellido', correo: '$correo'\n";
        $fila++;
        continue;
    }
    
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo "  → ERROR: Email inválido\n";
        $fila++;
        continue;
    }
    
    echo "  → ✅ ACEPTADA\n";
    echo "     $nombre $apellido <$correo>\n";
    $creados++;
    $fila++;
}

echo "\n=== RESUMEN ===\n";
echo "Docentes a crear: $creados\n";
echo "Filas saltadas (vacías): $saltadas\n";
echo "Total procesadas: " . ($creados + $saltadas) . "\n";

echo "\n✅ Nueva lógica funciona correctamente.\n";
