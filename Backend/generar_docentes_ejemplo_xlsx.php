<?php
require 'vendor/autoload.php';

use OpenSpout\Writer\XLSX\Writer;
use OpenSpout\Common\Entity\Row;

// Crear writer para XLSX
$writer = new Writer();
$writer->openToFile('docentes_ejemplo.xlsx');

// Headers
$headers = new Row(['nombre', 'apellido', 'correo', 'ci', 'contraseña', 'teléfono', 'sexo', 'dirección', 'especialidad', 'fecha_contrato']);
$writer->addRow($headers);

// Datos de ejemplo
$docentes = [
    [
        'Juan',
        'García López',
        'juan.garcia@escuela.edu',
        '1234567890',
        'Password123!',
        '+34 912 345 678',
        'M',
        'Calle Principal 123, Madrid',
        'Matemáticas',
        '2023-01-15',
    ],
    [
        'María',
        'Rodríguez García',
        'maria.rodriguez@escuela.edu',
        '1234567891',
        'Password456!',
        '+34 912 345 679',
        'F',
        'Calle Secundaria 456, Madrid',
        'Literatura',
        '2023-02-20',
    ],
    [
        'Pedro',
        'Martínez Díaz',
        'pedro.martinez@escuela.edu',
        '1234567892',
        'Password789!',
        '+34 912 345 680',
        'M',
        'Avenida Central 789, Madrid',
        'Física',
        '2023-03-10',
    ],
    [
        'Ana',
        'López Fernández',
        'ana.lopez@escuela.edu',
        '1234567893',
        'PasswordABC!',
        '+34 912 345 681',
        'F',
        'Plaza Mayor 321, Madrid',
        'Química',
        '2023-04-05',
    ],
    [
        'Carlos',
        'Fernández González',
        'carlos.fernandez@escuela.edu',
        '1234567894',
        'PasswordDEF!',
        '+34 912 345 682',
        'M',
        'Paseo del Prado 654, Madrid',
        'Historia',
        '2023-05-12',
    ],
];

// Agregar filas de datos
foreach ($docentes as $docente) {
    $writer->addRow(new Row($docente));
}

// Cerrar el writer
$writer->close();

echo "Archivo 'docentes_ejemplo.xlsx' creado exitosamente\n";
echo "Total de docentes: " . count($docentes) . "\n";
?>
