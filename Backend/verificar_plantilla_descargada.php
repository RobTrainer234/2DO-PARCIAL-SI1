<?php

// Verifica si la plantilla descargada puede ser leída correctamente

require_once __DIR__ . '/vendor/autoload.php';

use OpenSpout\Reader\XLSX\Reader as XLSXReader;

echo "=== Verificación de Plantilla Descargada ===\n\n";

$plantillaPath = __DIR__ . '/storage/temp/Plantilla_Importar_Docentes.xlsx';

if (!file_exists($plantillaPath)) {
    echo "❌ No existe plantilla previa. Descarga una desde el navegador primero.\n";
    exit(1);
}

echo "✓ Archivo encontrado: $plantillaPath\n";
echo "✓ Tamaño: " . filesize($plantillaPath) . " bytes\n";
echo "✓ Última modificación: " . date('Y-m-d H:i:s', filemtime($plantillaPath)) . "\n\n";

try {
    $reader = new XLSXReader();
    $reader->open($plantillaPath);
    
    $rowCount = 0;
    $maxRowsToShow = 5;
    
    foreach ($reader->getSheetIterator() as $sheet) {
        echo "Hoja: " . $sheet->getName() . "\n\n";
        
        foreach ($sheet->getRowIterator() as $indexFila => $row) {
            $rowCount++;
            $cells = $row->getCells();
            $rowData = [];
            
            foreach ($cells as $cell) {
                $rowData[] = $cell->getValue();
            }
            
            if ($rowCount <= $maxRowsToShow) {
                if ($indexFila == 1) {
                    echo "HEADERS:\n";
                } else {
                    echo "Fila $indexFila:\n";
                }
                
                foreach ($rowData as $idx => $value) {
                    $col = chr(65 + $idx); // A, B, C, etc
                    echo "  $col: '" . $value . "'\n";
                }
                echo "\n";
            }
            
            if ($rowCount > 20) break; // Limitar lectura
        }
        
        echo "Total de filas en la hoja: $rowCount\n";
        break;
    }
    
    $reader->close();
    
    echo "\n✅ Plantilla verificada correctamente.\n";
    echo "Ahora puedes llenarla y subirla desde el navegador.\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
