<?php

// Diagnóstico de importación de plantilla Excel

require_once __DIR__ . '/vendor/autoload.php';

use OpenSpout\Reader\XLSX\Reader as XLSXReader;
use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;

echo "=== Diagnóstico de Importación ===\n\n";

// Ruta del archivo generado
$plantillaPath = __DIR__ . '/storage/temp/Plantilla_Importar_Docentes.xlsx';

// Crear plantilla si no existe
if (!file_exists($plantillaPath)) {
    echo "1. Creando plantilla...\n";
    
    if (!is_dir(dirname($plantillaPath))) {
        mkdir(dirname($plantillaPath), 0755, true);
        echo "   ✓ Directorio creado\n";
    }
    
    $writer = new Writer();
    $writer->openToFile($plantillaPath);
    
    $headers = [
        'nombre', 'apellido', 'correo', 'ci', 'contraseña',
        'teléfono', 'sexo', 'dirección', 'especialidad', 'fecha_contrato'
    ];
    $writer->addRow(Row::fromValues($headers));
    
    $ejemplo = [
        'Juan', 'Pérez García', 'juan.perez@escuela.edu', '12345678', 'Password123!',
        '+591-77777777', 'M', 'Calle Principal 123, La Paz', 'Matemáticas', '2024-01-15'
    ];
    $writer->addRow(Row::fromValues($ejemplo));
    
    for ($i = 0; $i < 9; $i++) {
        $writer->addRow(Row::fromValues([
            '', '', '', '', '', '', '', '', '', ''
        ]));
    }
    
    $writer->close();
    echo "   ✓ Plantilla creada\n";
}

echo "\n✓ Archivo encontrado: $plantillaPath\n";
echo "✓ Tamaño: " . filesize($plantillaPath) . " bytes\n\n";

try {
    echo "2. Intentando abrir archivo Excel...\n";
    $reader = new XLSXReader();
    $reader->open($plantillaPath);
    echo "   ✓ Reader creado exitosamente\n";
    
    echo "3. Iterando hojas...\n";
    $sheetCount = 0;
    foreach ($reader->getSheetIterator() as $sheet) {
        $sheetCount++;
        echo "   ✓ Hoja $sheetCount: " . $sheet->getName() . "\n";
        
        echo "4. Iterando filas...\n";
        $rowCount = 0;
        $allData = [];
        foreach ($sheet->getRowIterator() as $indexFila => $row) {
            $rowCount++;
            $cells = $row->getCells();
            $rowData = [];
            
            foreach ($cells as $cell) {
                $rowData[] = $cell->getValue();
            }
            
            $allData[] = $rowData;
            
            if ($indexFila == 1) {
                echo "   Fila 1 (Headers): " . implode(' | ', $rowData) . "\n";
            } elseif ($indexFila == 2) {
                echo "   Fila 2 (Ejemplo): " . implode(' | ', array_slice($rowData, 0, 3)) . " ...\n";
            }
            
            if ($rowCount >= 3) break;
        }
        
        echo "   ✓ Total de filas leídas: $rowCount\n\n";
        
        // Validación de estructura
        echo "5. Validando estructura...\n";
        if (count($allData) > 0) {
            $headers = $allData[0];
            echo "   Columnas esperadas: nombre, apellido, correo, ci, contraseña, teléfono, sexo, dirección, especialidad, fecha_contrato\n";
            echo "   Columnas encontradas: " . implode(', ', $headers) . "\n";
            
            if (count($headers) == 10) {
                echo "   ✓ Número de columnas correcto (10)\n";
            } else {
                echo "   ❌ Número de columnas incorrecto (encontradas: " . count($headers) . ")\n";
            }
        }
        
        break; // Solo primera hoja
    }
    
    $reader->close();
    
    echo "\n✅ LECTURA EXITOSA\n";
    echo "El archivo Excel puede ser leído correctamente.\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
