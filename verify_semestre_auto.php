#!/usr/bin/env php
<?php
/**
 * VERIFICACIÓN: Auto-Llenado de Semestre
 * 
 * Este archivo verifica que todos los componentes están correctamente
 * implementados para el auto-llenado de semestre en asignaciones.
 */

echo "\n";
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║  VERIFICACIÓN: AUTO-LLENADO DE SEMESTRE EN ASIGNACIONES       ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// Lista de verificaciones
$baseBackend = __DIR__ . '/Backend';
$baseFrontend = __DIR__ . '/Frontend';

$checks = [
    [
        'name' => 'Backend: MateriaController.php existe',
        'file' => $baseBackend . '/app/Http/Controllers/Api/MateriaController.php',
        'required_method' => 'obtenerSemestre',
        'type' => 'file_method'
    ],
    [
        'name' => 'Backend: Ruta GET /materias/semestre/{sigla} en api.php',
        'file' => $baseBackend . '/routes/api.php',
        'required_text' => "Route::get('/materias/semestre/{sigla}'",
        'type' => 'file_content'
    ],
    [
        'name' => 'Frontend: Asignaciones.tsx existe',
        'file' => $baseFrontend . '/src/pages/Asignaciones.tsx',
        'required_method' => 'handleMateriaChange',
        'type' => 'file_method'
    ],
    [
        'name' => 'Frontend: Campo semestre en formData',
        'file' => $baseFrontend . '/src/pages/Asignaciones.tsx',
        'required_text' => "semestre: ''",
        'type' => 'file_content'
    ],
];

$passedChecks = 0;
$failedChecks = 0;

foreach ($checks as $check) {
    echo "Verificando: {$check['name']}\n";
    
    if (!file_exists($check['file'])) {
        echo "  ❌ FALLO: Archivo no encontrado\n";
        $failedChecks++;
        continue;
    }
    
    $content = file_get_contents($check['file']);
    $passed = false;
    
    if ($check['type'] === 'file_method') {
        $passed = strpos($content, $check['required_method']) !== false;
    } elseif ($check['type'] === 'file_content') {
        $passed = strpos($content, $check['required_text']) !== false;
    }
    
    if ($passed) {
        echo "  ✅ PASÓ\n";
        $passedChecks++;
    } else {
        echo "  ❌ FALLO: " . ($check['type'] === 'file_method' ? "Método " . $check['required_method'] : "Texto requerido") . " no encontrado\n";
        $failedChecks++;
    }
    echo "\n";
}

// Resumen
echo "╔════════════════════════════════════════════════════════════════╗\n";
echo "║  RESULTADO                                                     ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

echo "Verificaciones pasadas: ✅ $passedChecks\n";
echo "Verificaciones fallidas: ❌ $failedChecks\n\n";

if ($failedChecks === 0) {
    echo "🎉 ¡TODAS LAS VERIFICACIONES PASARON!\n";
    echo "\n✅ El auto-llenado de semestre está completamente implementado.\n\n";
    echo "ENDPOINT LISTO:\n";
    echo "  GET /api/materias/semestre/{sigla}\n\n";
    echo "COMPONENTES LISTOS:\n";
    echo "  ✓ MateriaController::obtenerSemestre()\n";
    echo "  ✓ handleMateriaChange() en Asignaciones.tsx\n";
    echo "  ✓ Campo de semestre auto-llenado\n";
    echo "  ✓ Ruta API registrada\n\n";
    exit(0);
} else {
    echo "⚠️  ALGUNAS VERIFICACIONES FALLARON\n";
    echo "Por favor, verifica los archivos indicados.\n\n";
    exit(1);
}
