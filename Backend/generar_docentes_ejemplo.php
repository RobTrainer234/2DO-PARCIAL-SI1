<?php

/**
 * Script para generar un archivo CSV de ejemplo
 * para la importación de docentes.
 * 
 * Uso: php generar_docentes_ejemplo.php
 * Salida: docentes_ejemplo.csv
 * 
 * Nota: Después de generar el CSV, puedes abrirlo en Excel y guardarlo como .xlsx
 * si lo deseas, pero por ahora solo se soporta CSV en la importación.
 */

// Datos de ejemplo para docentes
$docentes = [
    [
        'nombre' => 'Juan',
        'apellido' => 'Pérez García',
        'correo' => 'juan.perez@ficct.test',
        'ci' => '12345678',
        'contrasena' => 'Pass123!Docente',
        'telefono' => '+591-77777777',
        'sexo' => 'M',
        'direccion' => 'Calle Principal 123, La Paz',
        'especialidad' => 'Ingeniería de Sistemas',
        'fecha_contrato' => '2024-01-15'
    ],
    [
        'nombre' => 'María',
        'apellido' => 'López Martínez',
        'correo' => 'maria.lopez@ficct.test',
        'ci' => '87654321',
        'contrasena' => 'Pass456!Docente',
        'telefono' => '+591-77777776',
        'sexo' => 'F',
        'direccion' => 'Avenida Secundaria 456, La Paz',
        'especialidad' => 'Administración de Empresas',
        'fecha_contrato' => '2024-02-20'
    ],
    [
        'nombre' => 'Carlos',
        'apellido' => 'Rodríguez Sánchez',
        'correo' => 'carlos.rodriguez@ficct.test',
        'ci' => '11223344',
        'contrasena' => 'Pass789!Docente',
        'telefono' => '+591-77777775',
        'sexo' => 'M',
        'direccion' => 'Calle Tercera 789, La Paz',
        'especialidad' => 'Contabilidad',
        'fecha_contrato' => '2024-03-10'
    ],
    [
        'nombre' => 'Laura',
        'apellido' => 'González Torres',
        'correo' => 'laura.gonzalez@ficct.test',
        'ci' => '55667788',
        'contrasena' => 'Pass101!Docente',
        'telefono' => '+591-77777774',
        'sexo' => 'F',
        'direccion' => 'Av. Central 1000, La Paz',
        'especialidad' => 'Derecho',
        'fecha_contrato' => '2024-01-05'
    ],
    [
        'nombre' => 'Roberto',
        'apellido' => 'Fernández López',
        'correo' => 'roberto.fernandez@ficct.test',
        'ci' => '99887766',
        'contrasena' => 'Pass202!Docente',
        'telefono' => '+591-77777773',
        'sexo' => 'M',
        'direccion' => 'Calle Nueva 2000, La Paz',
        'especialidad' => 'Medicina',
        'fecha_contrato' => '2024-02-28'
    ]
];

// Crear el contenido CSV
$fp = fopen('php://memory', 'w');

// Headers
$headers = ['nombre', 'apellido', 'correo', 'ci', 'contraseña', 'teléfono', 'sexo', 'dirección', 'especialidad', 'fecha_contrato'];
fputcsv($fp, $headers);

// Datos
foreach ($docentes as $docente) {
    $row = [
        $docente['nombre'],
        $docente['apellido'],
        $docente['correo'],
        $docente['ci'],
        $docente['contrasena'],
        $docente['telefono'],
        $docente['sexo'],
        $docente['direccion'],
        $docente['especialidad'],
        $docente['fecha_contrato']
    ];
    fputcsv($fp, $row);
}

// Obtener contenido
rewind($fp);
$contenido = stream_get_contents($fp);
fclose($fp);

// Guardar como archivo
$archivo = 'docentes_ejemplo.csv';
file_put_contents($archivo, $contenido);

echo "✓ Archivo '$archivo' creado exitosamente en: " . getcwd() . "\n";
echo "  Contiene " . count($docentes) . " docentes de ejemplo\n";
echo "\n✓ Verificación del contenido:\n";
echo "  Líneas: " . (count($docentes) + 1) . " (headers + datos)\n";
echo "  Columnas: " . count($headers) . "\n";
echo "\nPuedes usar este archivo para probar la importación en la aplicación.\n";
echo "✅ NOTA: Se soportan archivos CSV y Excel (.xlsx, .xls).\n";
echo "    Puedes usar este CSV directamente o convertirlo a Excel en tu aplicación.\n";

?>
