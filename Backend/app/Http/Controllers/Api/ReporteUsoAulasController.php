<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Infraestructura;
use App\Models\Horarios;
use App\Models\DocenteGrupoMateria;
use Illuminate\Support\Facades\DB;

class ReporteUsoAulasController extends Controller
{
    /**
     * CU18: Generar reporte de uso de aulas por período
     * Retorna: número de sesiones, horas totales, ocupación, estado de aulas
     */
    public function reporteUsoAulas()
    {
        $aulas = Infraestructura::with(['horarios' => function ($query) {
            $query->with(['asignacion.gestion']);
        }, 'tipo'])->get();

        $reporteAulas = $aulas->map(function ($aula) {
            $horarios = $aula->horarios;
            $sesiones = $horarios->count();
            
            // Calcular horas totales
            $horasTotales = 0;
            foreach ($horarios as $horario) {
                $inicio = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_inicio);
                $final = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_final);
                $minutos = $inicio->diffInMinutes($final);
                $horasTotales += $minutos / 60;
            }

            // Obtener docentes y materias asociadas
            $docentes = $horarios->unique('asignacion.id_docente')->count();
            $materias = $horarios->unique('asignacion.id_materia')->count();
            $grupos = $horarios->unique('asignacion.id_grupo')->count();

            // Calcular ocupación (sesiones por semana)
            $ocupacion = $sesiones;

            // Distribuir por día
            $distribucionDia = $horarios->groupBy('dia')->map(function ($h) {
                return $h->count();
            });

            return [
                'id_infraestructura' => $aula->id_infraestructura,
                'nro' => $aula->nro,
                'piso' => $aula->piso,
                'capacidad' => $aula->capacidad,
                'tipo' => $aula->tipo->nombre ?? 'Sin tipo',
                'sesiones_totales' => $sesiones,
                'horas_totales' => round($horasTotales, 2),
                'docentes' => $docentes,
                'materias' => $materias,
                'grupos' => $grupos,
                'ocupacion' => $ocupacion,
                'distribucion_por_dia' => $distribucionDia,
                'promedio_horas_por_sesion' => $sesiones > 0 ? round($horasTotales / $sesiones, 2) : 0
            ];
        });

        // Estadísticas generales
        $estadisticas = [
            'total_aulas' => $aulas->count(),
            'aulas_activas' => $reporteAulas->filter(fn($a) => $a['sesiones_totales'] > 0)->count(),
            'horas_totales_utilizadas' => round($reporteAulas->sum('horas_totales'), 2),
            'promedio_horas_por_aula' => round($reporteAulas->avg('horas_totales'), 2),
            'aula_mas_utilizada' => $reporteAulas->sortByDesc('horas_totales')->first(),
            'aula_menos_utilizada' => $reporteAulas->sortBy('horas_totales')->filter(fn($a) => $a['sesiones_totales'] > 0)->first(),
        ];

        return response()->json([
            'success' => true,
            'estadisticas' => $estadisticas,
            'detalle_aulas' => $reporteAulas->values()
        ]);
    }

    /**
     * CU18: Reporte de uso de aulas por tipo
     */
    public function reporteUsoAulasPorTipo()
    {
        $reportePorTipo = DB::table('Infraestructura')
            ->leftJoin('Tipo', 'Infraestructura.id_tipo', '=', 'Tipo.id_tipo')
            ->leftJoin('Horarios', 'Infraestructura.id_infraestructura', '=', 'Horarios.id_infraestructura')
            ->selectRaw('
                Tipo.nombre as tipo,
                COUNT(DISTINCT Infraestructura.id_infraestructura) as cantidad_aulas,
                COUNT(DISTINCT Horarios.id_horario) as total_sesiones,
                COALESCE(AVG(Infraestructura.capacidad), 0) as capacidad_promedio
            ')
            ->groupBy('Tipo.nombre')
            ->get();

        return response()->json([
            'success' => true,
            'reporte' => $reportePorTipo
        ]);
    }

    /**
     * CU18: Reporte de uso de aulas por docente
     */
    public function reporteUsoAulasPorDocente()
    {
        $reportePorDocente = DB::table('Docente')
            ->leftJoin('DocenteGrupoMateria', 'Docente.cod_docente', '=', 'DocenteGrupoMateria.id_docente')
            ->leftJoin('Horarios', 'DocenteGrupoMateria.id_asignacion', '=', 'Horarios.id_asignacion')
            ->leftJoin('Infraestructura', 'Horarios.id_infraestructura', '=', 'Infraestructura.id_infraestructura')
            ->selectRaw('
                Docente.cod_docente,
                CONCAT(Docente.nombre, \' \', Docente.apellido) as docente,
                COUNT(DISTINCT Infraestructura.id_infraestructura) as aulas_utilizadas,
                COUNT(DISTINCT Horarios.id_horario) as total_sesiones,
                GROUP_CONCAT(DISTINCT Infraestructura.nro) as numeros_aula
            ')
            ->groupBy('Docente.cod_docente', 'Docente.nombre', 'Docente.apellido')
            ->havingRaw('COUNT(DISTINCT Horarios.id_horario) > 0')
            ->get();

        return response()->json([
            'success' => true,
            'reporte' => $reportePorDocente
        ]);
    }
}
