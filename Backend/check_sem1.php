<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\Materia;

echo "\n📚 MATERIAS DEL SEMESTRE 1:\n";
$s1 = Materia::where('semestre', 1)->orderBy('sigla')->get();
foreach ($s1 as $m) {
    echo "   {$m->sigla} - {$m->nombre} ({$m->creditos} cr, {$m->horas_teoricas}h T + {$m->horas_practicas}h P)\n";
}

?>
