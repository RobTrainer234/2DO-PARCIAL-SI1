<?php

// Diagnóstico de importación: Simular proceso completo

require_once __DIR__ . '/vendor/autoload.php';

use OpenSpout\Reader\XLSX\Reader as XLSXReader;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;

echo "=== Diagnóstico Completo de Importación ===\n\n";

// 1. Crear plantilla de prueba
$plantillaPath = __DIR__ . '/storage/temp/test_import.xlsx';

echo "1. Creando archivo Excel de prueba...\n";
if (!is_dir(dirname($plantillaPath))) {
    mkdir(dirname($plantillaPath), 0755, true);
}

$writer = new Writer();
$writer->openToFile($plantillaPath);

// Headers
$headers = [
    'nombre', 'apellido', 'correo', 'ci', 'contraseña',
    'teléfono', 'sexo', 'dirección', 'especialidad', 'fecha_contrato'
];
$writer->addRow(Row::fromValues($headers));

// Fila de prueba
$testRow = [
    'Carlos',           // nombre
    'López Martinez',   // apellido
    'carlos@test.com',  // correo
    '87654321',         // ci
    'TestPass123!',     // contraseña
    '+591-77777777',    // teléfono
    'M',                // sexo
    'Calle Test 456',   // dirección
    'Física',           // especialidad
    '2024-01-15'        // fecha_contrato
];
$writer->addRow(Row::fromValues($testRow));

$writer->close();
echo "   ✓ Archivo creado: $plantillaPath\n\n";

// 2. Simular lectura exacta que hace el controlador
echo "2. Simulando lectura del controlador...\n";

try {
    $reader = new XLSXReader();
    $reader->open($plantillaPath);
    
    $datos = [];
    
    foreach ($reader->getSheetIterator() as $sheet) {
        foreach ($sheet->getRowIterator() as $indexFila => $row) {
            $cells = $row->getCells();
            $rowData = [];
            
            foreach ($cells as $cell) {
                $rowData[] = $cell->getValue();
            }
            
            echo "   Fila $indexFila: " . count($rowData) . " celdas\n";
            
            // Saltar header (primera fila)
            if ($indexFila > 1) {
                $datos[] = $rowData;
                echo "      → Agregada a datos para procesar\n";
            }
        }
        break;
    }
    
    $reader->close();
    
    echo "   ✓ Total de filas leídas (sin header): " . count($datos) . "\n\n";
    
    // 3. Simular procesamiento de datos como lo hace el controlador
    echo "3. Procesando datos como el controlador...\n";
    
    $resultados = [
        'creados' => 0,
        'errores' => 0,
        'duplicados' => 0,
        'detalles_errores' => [],
        'detalles_duplicados' => []
    ];
    
    $fila = 2; // Empezar desde fila 2
    
    foreach ($datos as $row) {
        echo "\n   Procesando fila $fila:\n";
        echo "   Array recibido: " . json_encode($row) . "\n";
        
        if (empty($row) || empty($row[0])) {
            echo "   ❌ Fila vacía o sin primer elemento\n";
            $resultados['errores']++;
            $fila++;
            continue;
        }
        
        $nombre = trim($row[0] ?? '');
        $apellido = trim($row[1] ?? '');
        $correo = trim($row[2] ?? '');
        $ci = trim($row[3] ?? '');
        $password = trim($row[4] ?? '');
        $telefono = trim($row[5] ?? '');
        $sexo = trim($row[6] ?? 'M');
        $direccion = trim($row[7] ?? '');
        $especialidad = trim($row[8] ?? '');
        $fecha_contrato = trim($row[9] ?? '');
        
        echo "   Valores extraídos:\n";
        echo "     nombre: '$nombre'\n";
        echo "     apellido: '$apellido'\n";
        echo "     correo: '$correo'\n";
        echo "     ci: '$ci'\n";
        echo "     password: '$password'\n";
        echo "     telefono: '$telefono'\n";
        echo "     sexo: '$sexo'\n";
        echo "     direccion: '$direccion'\n";
        echo "     especialidad: '$especialidad'\n";
        echo "     fecha_contrato: '$fecha_contrato'\n";
        
        // Validaciones básicas
        echo "\n   Validaciones:\n";
        
        if (empty($nombre)) {
            echo "   ❌ Campo 'nombre' vacío\n";
            $resultados['errores']++;
            $resultados['detalles_errores'][] = [
                'fila' => $fila,
                'razon' => 'Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)'
            ];
            $fila++;
            continue;
        }
        echo "   ✓ Nombre presente: $nombre\n";
        
        if (empty($apellido)) {
            echo "   ❌ Campo 'apellido' vacío\n";
            $resultados['errores']++;
            $resultados['detalles_errores'][] = [
                'fila' => $fila,
                'razon' => 'Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)'
            ];
            $fila++;
            continue;
        }
        echo "   ✓ Apellido presente: $apellido\n";
        
        if (empty($correo)) {
            echo "   ❌ Campo 'correo' vacío\n";
            $resultados['errores']++;
            $resultados['detalles_errores'][] = [
                'fila' => $fila,
                'razon' => 'Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)'
            ];
            $fila++;
            continue;
        }
        echo "   ✓ Correo presente: $correo\n";
        
        if (empty($ci)) {
            echo "   ❌ Campo 'ci' vacío\n";
            $resultados['errores']++;
            $resultados['detalles_errores'][] = [
                'fila' => $fila,
                'razon' => 'Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)'
            ];
            $fila++;
            continue;
        }
        echo "   ✓ CI presente: $ci\n";
        
        if (empty($password)) {
            echo "   ❌ Campo 'contraseña' vacío\n";
            $resultados['errores']++;
            $resultados['detalles_errores'][] = [
                'fila' => $fila,
                'razon' => 'Faltan campos requeridos (nombre, apellido, correo, ci, contraseña)'
            ];
            $fila++;
            continue;
        }
        echo "   ✓ Contraseña presente: " . substr($password, 0, 3) . "***\n";
        
        // Validar email
        if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            echo "   ❌ Email inválido: $correo\n";
            $resultados['errores']++;
            $resultados['detalles_errores'][] = [
                'fila' => $fila,
                'razon' => "Email inválido: $correo"
            ];
            $fila++;
            continue;
        }
        echo "   ✓ Email válido\n";
        
        echo "   ✅ Fila $fila lista para insertar\n";
        $resultados['creados']++;
        
        $fila++;
    }
    
    echo "\n\n=== RESUMEN ===\n";
    echo "Docentes creados: " . $resultados['creados'] . "\n";
    echo "Duplicados: " . $resultados['duplicados'] . "\n";
    echo "Errores: " . $resultados['errores'] . "\n";
    
    if (count($resultados['detalles_errores']) > 0) {
        echo "\nDetalles de errores:\n";
        foreach ($resultados['detalles_errores'] as $error) {
            echo "  - Fila " . $error['fila'] . ": " . $error['razon'] . "\n";
        }
    }
    
    if ($resultados['creados'] > 0) {
        echo "\n✅ DIAGNÓSTICO: El sistema debería insertar " . $resultados['creados'] . " registro(s)\n";
    } else {
        echo "\n❌ DIAGNÓSTICO: Algo está impidiendo que se inserten los datos\n";
    }
    
} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    exit(1);
}
