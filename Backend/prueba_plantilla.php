<?php

// Prueba rápida del método descargarPlantillaExcel

require_once __DIR__ . '/vendor/autoload.php';

use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;

echo "=== Prueba de Descarga de Plantilla ===\n\n";

try {
    echo "1. Creando archivo XLSX...\n";
    $writer = new Writer();
    
    $fileName = 'Plantilla_Importar_Docentes.xlsx';
    $tempPath = __DIR__ . '/storage/temp/' . $fileName;
    
    // Crear directorio si no existe
    if (!is_dir(__DIR__ . '/storage/temp')) {
        mkdir(__DIR__ . '/storage/temp', 0755, true);
        echo "   ✓ Directorio creado: " . __DIR__ . '/storage/temp' . "\n";
    }
    
    echo "2. Abriendo archivo en: $tempPath\n";
    $writer->openToFile($tempPath);
    
    echo "3. Escribiendo headers...\n";
    $headers = [
        'nombre',
        'apellido',
        'correo',
        'ci',
        'contraseña',
        'teléfono',
        'sexo',
        'dirección',
        'especialidad',
        'fecha_contrato'
    ];
    
    $writer->addRow(Row::fromValues($headers));
    echo "   ✓ Headers escritos: " . count($headers) . " columnas\n";
    
    echo "4. Escribiendo fila de ejemplo...\n";
    $ejemplo = [
        'Juan',
        'Pérez García',
        'juan.perez@escuela.edu',
        '12345678',
        'Password123!',
        '+591-77777777',
        'M',
        'Calle Principal 123, La Paz',
        'Matemáticas',
        '2024-01-15'
    ];
    
    $writer->addRow(Row::fromValues($ejemplo));
    echo "   ✓ Fila ejemplo escrita\n";
    
    echo "5. Escribiendo 9 filas vacías...\n";
    for ($i = 0; $i < 9; $i++) {
        $writer->addRow(Row::fromValues([
            '', '', '', '', '', '', '', '', '', ''
        ]));
    }
    echo "   ✓ Filas vacías escritas\n";
    
    echo "6. Cerrando archivo...\n";
    $writer->close();
    echo "   ✓ Archivo cerrado\n";
    
    echo "7. Verificando archivo...\n";
    if (file_exists($tempPath)) {
        $fileSize = filesize($tempPath);
        echo "   ✓ Archivo existe\n";
        echo "   ✓ Tamaño: " . $fileSize . " bytes\n";
        echo "   ✓ Ubicación: $tempPath\n";
    } else {
        echo "   ✗ ERROR: Archivo no existe\n";
        exit(1);
    }
    
    echo "\n✅ PRUEBA EXITOSA\n";
    echo "El archivo puede descargarse correctamente.\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    exit(1);
}
