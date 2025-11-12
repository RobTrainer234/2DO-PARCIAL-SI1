<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\Materia;

// Verificar materias que podrían faltar
$faltantes = ['MAT101', 'LIN100'];
foreach ($faltantes as $sigla) {
    $m = Materia::find($sigla);
    if ($m) {
        echo "✓ $sigla existe: {$m->nombre} (semestre: {$m->semestre})\n";
    } else {
        echo "✗ $sigla NO EXISTE\n";
    }
}

// Crear las que faltan
echo "\nCreando materias faltantes...\n";

$nuevas = [
    ['sigla' => 'MAT101', 'nombre' => 'Cálculo 1', 'semestre' => 1, 'horas_teoricas' => 4, 'horas_practicas' => 2, 'creditos' => 5],
    ['sigla' => 'LIN100', 'nombre' => 'Inglés Técnico 1', 'semestre' => 1, 'horas_teoricas' => 3, 'horas_practicas' => 0, 'creditos' => 2],
];

foreach ($nuevas as $data) {
    $m = Materia::updateOrCreate(
        ['sigla' => $data['sigla']],
        $data
    );
    echo "✓ {$data['sigla']} - {$data['nombre']} agregada/actualizada\n";
}

echo "\n📚 MATERIAS DEL SEMESTRE 1 (ACTUALIZADO):\n";
$s1 = Materia::where('semestre', 1)->orderBy('sigla')->get();
foreach ($s1 as $m) {
    echo "   {$m->sigla} - {$m->nombre} ({$m->creditos} cr)\n";
}

?>
