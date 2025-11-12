<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\Materia;

echo "\n╔════════════════════════════════════════════════════════════╗\n";
echo "║     ✅ MATERIAS CARGADAS - VERIFICACIÓN                   ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

$totalMaterias = Materia::count();
echo "📚 TOTAL DE MATERIAS: $totalMaterias\n\n";

echo "📋 MATERIAS POR SEMESTRE:\n";
for ($i = 1; $i <= 10; $i++) {
    $count = Materia::where('semestre', $i)->count();
    if ($count > 0) {
        echo "   Semestre $i: $count materias\n";
    }
}

$electivas = Materia::whereNull('semestre')->count();
echo "   Electivas: $electivas materias\n\n";

echo "🎓 PRIMERAS MATERIAS DE CADA SEMESTRE:\n";
for ($i = 1; $i <= 5; $i++) {
    $materia = Materia::where('semestre', $i)->first();
    if ($materia) {
        echo "   Semestre $i: {$materia->sigla} - {$materia->nombre} ({$materia->creditos} créditos)\n";
    }
}

echo "\n✅ Todas las materias han sido cargadas exitosamente!\n";
echo "   Ahora puedes verlas en: http://localhost:5173/materias\n\n";

?>
