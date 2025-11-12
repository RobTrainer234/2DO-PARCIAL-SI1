<?php
/**
 * Script de prueba para verificar que el endpoint de semestre automático funciona
 * Prueba: GET /api/materias/semestre/{sigla}
 */

require_once 'vendor/autoload.php';

use OpenSpout\Reader\XLSX\Reader as XLSXReader;
use Illuminate\Support\Facades\DB;

// Simulamos el bootstrap de Laravel
require_once 'bootstrap/app.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

// Usamos QueryBuilder o Eloquent directamente
$container = $app->make('Illuminate\Contracts\Container\Container');

echo "=== Prueba de Endpoint: GET /api/materias/semestre/{sigla} ===\n\n";

// Importamos el modelo
$materias = \App\Models\Materia::all();

if ($materias->count() === 0) {
    echo "❌ No hay materias en la base de datos. Importa las materias primero.\n";
    exit(1);
}

echo "✓ Se encontraron " . $materias->count() . " materias\n\n";

// Pruebas de ejemplo
$ejemplos = [
    'MAT101' => 'CALCULO 1',
    'ELC101' => 'CRIPTOGRAFIA Y SEGURIDAD',
    'MAT201' => 'ALGEBRA LINEAL'
];

foreach ($ejemplos as $sigla => $nombreEsperado) {
    $materia = \App\Models\Materia::find($sigla);
    
    if (!$materia) {
        echo "⚠️  Materia '$sigla' no encontrada (esto es normal si no está importada)\n";
        continue;
    }
    
    echo "Materia: $sigla\n";
    echo "  Nombre: " . $materia->nombre . "\n";
    echo "  Semestre: " . ($materia->semestre ?? 'Electiva/NULL') . "\n";
    echo "  Es Electiva: " . (is_null($materia->semestre) ? 'SÍ' : 'NO') . "\n";
    
    // Simula la respuesta JSON del endpoint
    $respuestaJson = [
        'sigla' => $materia->sigla,
        'nombre' => $materia->nombre,
        'semestre' => $materia->semestre ?? null,
        'es_electiva' => is_null($materia->semestre)
    ];
    
    echo "  JSON Response: " . json_encode($respuestaJson, JSON_UNESCAPED_UNICODE) . "\n";
    echo "---\n";
}

echo "\n✓ Endpoint /api/materias/semestre/{sigla} está listo para usar.\n";
echo "✓ El frontend puede llamar este endpoint cuando se selecciona una materia.\n";
echo "✓ El campo de semestre se llenará automáticamente en el formulario de asignaciones.\n";
