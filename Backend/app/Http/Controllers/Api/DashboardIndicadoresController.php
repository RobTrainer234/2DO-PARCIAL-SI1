<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Docente;
use App\Models\Asistencia;
use App\Models\Horarios;
use App\Models\DocenteGrupoMateria;
use App\Models\Grupo;
use App\Models\Infraestructura;
use Illuminate\Support\Facades\DB;

class DashboardIndicadoresController extends Controller
{
    /**
     * CU20: Obtener indicadores del dashboard
     * Retorna: estadísticas generales del sistema
     */
    public function obtenerIndicadores()
    {
        try {
            // Estadísticas de usuarios
            $totalUsuarios = Usuario::count();
            $usuariosActivos = $totalUsuarios; // No hay columna estado, contar todos

            // Estadísticas de docentes
            $totalDocentes = Docente::count();
            $docentesConAsignaciones = DB::table('DocenteGrupoMateria')
                ->select('id_docente')
                ->distinct()
                ->count('id_docente');

            // Estadísticas de grupos
            $totalGrupos = Grupo::count();
            $gruposConHorarios = DB::table('DocenteGrupoMateria')
                ->select('id_grupo')
                ->distinct()
                ->count('id_grupo');

            // Estadísticas de aulas
            $totalAulas = Infraestructura::count();
            $aulasConUso = Horarios::distinct('id_infraestructura')->count();

            // Estadísticas de asistencia
            $totalAsistencias = Asistencia::count();
            $asistenciasPresentes = Asistencia::where('estado', 'PRESENTE')->count();
            $asistenciasAusentes = Asistencia::where('estado', 'AUSENTE')->count();
            $asistenciasAtraso = Asistencia::where('estado', 'ATRASO')->count();
            $asistenciasJustificadas = Asistencia::where('estado', 'JUSTIFICADO')->count();

            // Porcentajes de asistencia
            $tasaAsistencia = $totalAsistencias > 0 
                ? round(($asistenciasPresentes / $totalAsistencias) * 100, 2)
                : 0;
            $tasaInasistencia = $totalAsistencias > 0
                ? round(($asistenciasAusentes / $totalAsistencias) * 100, 2)
                : 0;

            // Estadísticas de horarios
            $totalHorarios = Horarios::count();
            $horasPromedioPorClase = $this->calcularPromedioHoras();

            // Docentes más asignados
            $docentesMasAsignados = DocenteGrupoMateria::select('id_docente')
                ->selectRaw('COUNT(*) as total_asignaciones')
                ->join('Docente', 'DocenteGrupoMateria.id_docente', '=', 'Docente.cod_docente')
                ->selectRaw('CONCAT(Docente.nombre, \' \', Docente.apellido) as docente_nombre')
                ->groupBy('id_docente', 'Docente.nombre', 'Docente.apellido')
                ->orderByDesc('total_asignaciones')
                ->limit(5)
                ->get();

            // Grupos con más horarios
            $gruposConMasHorarios = DocenteGrupoMateria::select('id_grupo')
                ->selectRaw('COUNT(id_horario) as total_horarios')
                ->join('Grupo', 'DocenteGrupoMateria.id_grupo', '=', 'Grupo.id_grupo')
                ->join('Horarios', 'DocenteGrupoMateria.id_asignacion', '=', 'Horarios.id_asignacion')
                ->selectRaw('Grupo.descripcion')
                ->groupBy('id_grupo', 'Grupo.descripcion')
                ->orderByDesc('total_horarios')
                ->limit(5)
                ->get();

            // Aulas más utilizadas
            $aulasUtilizadas = Horarios::select('id_infraestructura')
                ->selectRaw('COUNT(*) as total_sesiones')
                ->join('Infraestructura', 'Horarios.id_infraestructura', '=', 'Infraestructura.id_infraestructura')
                ->selectRaw('Infraestructura.nro')
                ->groupBy('id_infraestructura', 'Infraestructura.nro')
                ->orderByDesc('total_sesiones')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'indicadores' => [
                    'usuarios' => [
                        'total' => $totalUsuarios,
                        'activos' => $usuariosActivos,
                        'porcentaje_activos' => $totalUsuarios > 0 ? round(($usuariosActivos / $totalUsuarios) * 100, 2) : 0
                    ],
                    'docentes' => [
                        'total' => $totalDocentes,
                        'con_asignaciones' => $docentesConAsignaciones,
                        'porcentaje_activos' => $totalDocentes > 0 ? round(($docentesConAsignaciones / $totalDocentes) * 100, 2) : 0
                    ],
                    'grupos' => [
                        'total' => $totalGrupos,
                        'con_horarios' => $gruposConHorarios,
                        'porcentaje_activos' => $totalGrupos > 0 ? round(($gruposConHorarios / $totalGrupos) * 100, 2) : 0
                    ],
                    'aulas' => [
                        'total' => $totalAulas,
                        'con_uso' => $aulasConUso,
                        'porcentaje_utilizadas' => $totalAulas > 0 ? round(($aulasConUso / $totalAulas) * 100, 2) : 0
                    ],
                    'asistencia' => [
                        'total_registros' => $totalAsistencias,
                        'presentes' => $asistenciasPresentes,
                        'ausentes' => $asistenciasAusentes,
                        'atrasos' => $asistenciasAtraso,
                        'justificados' => $asistenciasJustificadas,
                        'tasa_asistencia' => $tasaAsistencia,
                        'tasa_inasistencia' => $tasaInasistencia
                    ],
                    'horarios' => [
                        'total' => $totalHorarios,
                        'promedio_horas_por_clase' => $horasPromedioPorClase
                    ]
                ],
                'tops' => [
                    'docentes_mas_asignados' => $docentesMasAsignados,
                    'grupos_mas_horarios' => $gruposConMasHorarios,
                    'aulas_mas_utilizadas' => $aulasUtilizadas
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener indicadores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU20: Indicadores de asistencia
     */
    public function indicadoresAsistencia()
    {
        $estadisticas = DB::table('Asistencia')
            ->selectRaw('
                estado,
                COUNT(*) as total,
                ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Asistencia), 2) as porcentaje
            ')
            ->groupBy('estado')
            ->get();

        return response()->json([
            'success' => true,
            'asistencia' => $estadisticas
        ]);
    }

    /**
     * CU20: Indicadores de ocupación de aulas
     */
    public function indicadoresOcupacionAulas()
    {
        $ocupacion = DB::table('Infraestructura')
            ->leftJoin('Horarios', 'Infraestructura.id_infraestructura', '=', 'Horarios.id_infraestructura')
            ->selectRaw('
                Infraestructura.nro,
                Infraestructura.capacidad,
                COUNT(DISTINCT Horarios.id_horario) as sesiones,
                ROUND(COUNT(DISTINCT Horarios.id_horario) / 5.0 * 100, 2) as porcentaje_ocupacion
            ')
            ->groupBy('Infraestructura.id_infraestructura', 'Infraestructura.nro', 'Infraestructura.capacidad')
            ->orderByDesc('sesiones')
            ->get();

        return response()->json([
            'success' => true,
            'ocupacion_aulas' => $ocupacion
        ]);
    }

    /**
     * CU20: Indicadores de carga docente
     */
    public function indicadoresCargaDocente()
    {
        $cargaDocente = DB::table('Docente')
            ->leftJoin('DocenteGrupoMateria', 'Docente.cod_docente', '=', 'DocenteGrupoMateria.id_docente')
            ->leftJoin('Horarios', 'DocenteGrupoMateria.id_asignacion', '=', 'Horarios.id_asignacion')
            ->selectRaw('
                Docente.cod_docente,
                CONCAT(Docente.nombre, \' \', Docente.apellido) as docente,
                COUNT(DISTINCT DocenteGrupoMateria.id_asignacion) as asignaciones,
                COUNT(DISTINCT Horarios.id_horario) as total_horas
            ')
            ->groupBy('Docente.cod_docente', 'Docente.nombre', 'Docente.apellido')
            ->orderByDesc('total_horas')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'carga_docente' => $cargaDocente
        ]);
    }

    /**
     * Método privado para calcular promedio de horas por clase
     */
    private function calcularPromedioHoras()
    {
        $horarios = Horarios::all();
        
        if ($horarios->isEmpty()) {
            return 0;
        }

        $totalMinutos = 0;
        foreach ($horarios as $horario) {
            $inicio = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_inicio);
            $final = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_final);
            $totalMinutos += $inicio->diffInMinutes($final);
        }

        $horaPromedio = ($totalMinutos / $horarios->count()) / 60;
        return round($horaPromedio, 2);
    }
}
