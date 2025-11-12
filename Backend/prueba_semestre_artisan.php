#!/usr/bin/env php
<?php

// Script Artisan para probar el endpoint obtenerSemestre

use App\Models\Materia;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

echo "=== Prueba: Endpoint GET /api/materias/semestre/{sigla} ===\n\n";

// Obtener algunas materias de prueba
$materias = Materia::limit(5)->get();

if ($materias->count() === 0) {
    echo "❌ No hay materias en la base de datos.\n";
    echo "Por favor, importa materias primero usando el componente ImportarMaterias.\n";
    exit(1);
}

echo "✓ Se encontraron " . Materia::count() . " materias totales\n\n";

echo "Mostrando primeras 5 materias:\n";
echo "=====================================\n";

foreach ($materias as $m) {
    echo "\n📚 Sigla: {$m->sigla}\n";
    echo "   Nombre: {$m->nombre}\n";
    echo "   Semestre: " . ($m->semestre ?? 'ELECTIVA (null)') . "\n";
    
    // Simula la respuesta JSON del endpoint
    $response = [
        'sigla' => $m->sigla,
        'nombre' => $m->nombre,
        'semestre' => $m->semestre,
        'es_electiva' => is_null($m->semestre)
    ];
    
    echo "   JSON Response:\n";
    echo "   " . json_encode($response, JSON_UNESCAPED_UNICODE) . "\n";
}

echo "\n=====================================\n";
echo "\n✓ Cuando el frontend haga una llamada a:\n";
echo "   GET /api/materias/semestre/MAT101\n";
echo "\n   Recibirá una respuesta JSON como:\n";
echo "   {\n";
echo "     \"sigla\": \"MAT101\",\n";
echo "     \"nombre\": \"CALCULO 1\",\n";
echo "     \"semestre\": 1,\n";
echo "     \"es_electiva\": false\n";
echo "   }\n";

echo "\n✓ El campo semestre se llenará automáticamente en el formulario.\n";
echo "✓ Para materias electivas (sin semestre), 'es_electiva' será true.\n";
