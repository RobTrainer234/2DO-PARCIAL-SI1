<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$kernel->bootstrap();

use App\Models\Materia;

// Generar reporte completo de materias

$output = "\n╔════════════════════════════════════════════════════════════════════════════════╗\n";
$output .= "║           📚 REPORTE COMPLETO DE MATERIAS - INGENIERÍA EN SISTEMAS            ║\n";
$output .= "╚════════════════════════════════════════════════════════════════════════════════╝\n\n";

$totalMaterias = Materia::count();
$totalCreditos = Materia::sum('creditos');
$totalHorasT = Materia::sum('horas_teoricas');
$totalHorasP = Materia::sum('horas_practicas');

$output .= "📊 ESTADÍSTICAS GENERALES:\n";
$output .= "   • Total de materias: $totalMaterias\n";
$output .= "   • Total de créditos: $totalCreditos\n";
$output .= "   • Total horas teóricas: $totalHorasT\n";
$output .= "   • Total horas prácticas: $totalHorasP\n";
$output .= "   • Total horas: " . ($totalHorasT + $totalHorasP) . "\n\n";

// Por semestre
$output .= "📋 MATERIAS POR SEMESTRE:\n";
$output .= "─────────────────────────────────────────────────────────────────────────────────\n";

for ($i = 1; $i <= 10; $i++) {
    $materias = Materia::where('semestre', $i)->orderBy('sigla')->get();
    
    if ($materias->count() > 0) {
        $creditos = $materias->sum('creditos');
        $horasT = $materias->sum('horas_teoricas');
        $horasP = $materias->sum('horas_practicas');
        
        $output .= "\n🔹 SEMESTRE $i ({$materias->count()} materias | {$creditos} cr | {$horasT}h T + {$horasP}h P):\n";
        
        foreach ($materias as $m) {
            $output .= sprintf("   • %-8s | %-40s | %d cr (%dh T + %dh P)\n", 
                $m->sigla, 
                substr($m->nombre, 0, 40), 
                $m->creditos,
                $m->horas_teoricas,
                $m->horas_practicas
            );
        }
    }
}

// Electivas
$electivas = Materia::whereNull('semestre')->orderBy('sigla')->get();
if ($electivas->count() > 0) {
    $creditos = $electivas->sum('creditos');
    $horasT = $electivas->sum('horas_teoricas');
    $horasP = $electivas->sum('horas_practicas');
    
    $output .= "\n🔹 ELECTIVAS ({$electivas->count()} materias | {$creditos} cr | {$horasT}h T + {$horasP}h P):\n";
    
    foreach ($electivas as $m) {
        $output .= sprintf("   • %-8s | %-40s | %d cr (%dh T + %dh P)\n", 
            $m->sigla, 
            substr($m->nombre, 0, 40), 
            $m->creditos,
            $m->horas_teoricas,
            $m->horas_practicas
        );
    }
}

$output .= "\n─────────────────────────────────────────────────────────────────────────────────\n";
$output .= "\n✅ TODAS LAS MATERIAS ESTÁN DISPONIBLES EN EL SISTEMA\n\n";

echo $output;

// Guardar en archivo
file_put_contents('materias_reporte_completo.txt', $output);
echo "📄 Reporte guardado en: Backend/materias_reporte_completo.txt\n\n";

?>
