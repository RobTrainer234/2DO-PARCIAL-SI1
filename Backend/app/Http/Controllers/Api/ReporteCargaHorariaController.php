<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Horarios;
use App\Models\DocenteGrupoMateria;
use App\Models\Infraestructura;
use Illuminate\Http\Request;

class ReporteCargaHorariaController extends Controller
{
    /**
     * CU17: Generar reporte de carga horaria
     * Carga horaria por docente
     */
    public function reporteCargaHorariaDocente($cod_docente)
    {
        $asignaciones = DocenteGrupoMateria::where('cod_docente', $cod_docente)
            ->with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->get();

        $carga_horaria = [];
        $total_horas = 0;

        foreach ($asignaciones as $asignacion) {
            $horarios = Horarios::where('id_asignacion', $asignacion->id_asignacion)
                ->with('infraestructura')
                ->get();

            $horas_por_asignacion = 0;

            $horarios_procesados = [];
            foreach ($horarios as $horario) {
                $inicio = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_inicio);
                $fin = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_final);
                $minutos = $fin->diffInMinutes($inicio);
                $horas = $minutos / 60;
                $horas_por_asignacion += $horas;

                $horarios_procesados[] = [
                    'dia' => $horario->dia,
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_final' => $horario->hora_final,
                    'horas' => round($horas, 2),
                    'aula' => $horario->infraestructura->nro ?? 'N/A'
                ];
            }

            if ($horarios->count() > 0) {
                $total_horas += $horas_por_asignacion;
                $carga_horaria[] = [
                    'grupo' => $asignacion->grupo->nombre,
                    'materia' => $asignacion->materia->sigla . ' - ' . $asignacion->materia->nombre,
                    'gestion' => $asignacion->gestion->anio . ' - ' . $asignacion->gestion->periodo,
                    'horas_totales' => round($horas_por_asignacion, 2),
                    'horarios' => $horarios_procesados
                ];
            }
        }

        return response()->json([
            'docente' => $asignaciones->first()?->docente->usuario->nombre ?? 'No encontrado',
            'cod_docente' => $cod_docente,
            'total_horas_carga' => round($total_horas, 2),
            'carga_por_asignacion' => $carga_horaria
        ]);
    }

    /**
     * Reporte de carga horaria por grupo
     */
    public function reporteCargaHorariaGrupo($id_grupo)
    {
        $asignaciones = DocenteGrupoMateria::where('id_grupo', $id_grupo)
            ->with(['docente.usuario', 'materia', 'gestion'])
            ->get();

        $carga_horaria = [];
        $total_horas = 0;

        foreach ($asignaciones as $asignacion) {
            $horarios = Horarios::where('id_asignacion', $asignacion->id_asignacion)
                ->with('infraestructura')
                ->get();

            $horas_por_asignacion = 0;

            $horarios_procesados = [];
            foreach ($horarios as $horario) {
                $inicio = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_inicio);
                $fin = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_final);
                $minutos = $fin->diffInMinutes($inicio);
                $horas = $minutos / 60;
                $horas_por_asignacion += $horas;

                $horarios_procesados[] = [
                    'dia' => $horario->dia,
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_final' => $horario->hora_final,
                    'horas' => round($horas, 2),
                    'docente' => $asignacion->docente->usuario->nombre,
                    'aula' => $horario->infraestructura->nro ?? 'N/A'
                ];
            }

            if ($horarios->count() > 0) {
                $total_horas += $horas_por_asignacion;
                $carga_horaria[] = [
                    'docente' => $asignacion->docente->usuario->nombre,
                    'materia' => $asignacion->materia->sigla . ' - ' . $asignacion->materia->nombre,
                    'gestion' => $asignacion->gestion->anio . ' - ' . $asignacion->gestion->periodo,
                    'horas_totales' => round($horas_por_asignacion, 2),
                    'horarios' => $horarios_procesados
                ];
            }
        }

        return response()->json([
            'id_grupo' => $id_grupo,
            'total_horas_carga' => round($total_horas, 2),
            'carga_por_asignacion' => $carga_horaria
        ]);
    }

    /**
     * Reporte general de carga horaria por gestión
     */
    public function reporteCargaHorariaGestion($id_gestion)
    {
        $asignaciones = DocenteGrupoMateria::where('id_gestion', $id_gestion)
            ->with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->get();

        $carga_por_docente = [];
        $carga_por_aula = [];
        $total_horas = 0;

        // Agrupar por docente
        foreach ($asignaciones as $asignacion) {
            $horarios = Horarios::where('id_asignacion', $asignacion->id_asignacion)->get();

            $horas_asignacion = 0;
            foreach ($horarios as $horario) {
                $inicio = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_inicio);
                $fin = \Carbon\Carbon::createFromFormat('H:i:s', $horario->hora_final);
                $minutos = $fin->diffInMinutes($inicio);
                $horas_asignacion += ($minutos / 60);

                // Agrupar por aula
                if (!isset($carga_por_aula[$horario->id_infraestructura])) {
                    $carga_por_aula[$horario->id_infraestructura] = [
                        'aula' => $horario->infraestructura->nro ?? 'N/A',
                        'total_horas' => 0,
                        'usos' => 0
                    ];
                }
                $carga_por_aula[$horario->id_infraestructura]['total_horas'] += ($minutos / 60);
                $carga_por_aula[$horario->id_infraestructura]['usos']++;
            }

            $docente_nombre = $asignacion->docente->usuario->nombre;
            if (!isset($carga_por_docente[$docente_nombre])) {
                $carga_por_docente[$docente_nombre] = 0;
            }
            $carga_por_docente[$docente_nombre] += $horas_asignacion;
            $total_horas += $horas_asignacion;
        }

        // Convertir arrays indexados a valores
        $carga_docentes_formateada = [];
        foreach ($carga_por_docente as $docente => $horas) {
            $carga_docentes_formateada[] = [
                'docente' => $docente,
                'total_horas' => round($horas, 2)
            ];
        }

        $carga_aulas_formateada = [];
        foreach ($carga_por_aula as $aula) {
            $carga_aulas_formateada[] = [
                'aula' => $aula['aula'],
                'total_horas' => round($aula['total_horas'], 2),
                'usos' => $aula['usos']
            ];
        }

        return response()->json([
            'id_gestion' => $id_gestion,
            'total_horas_carga' => round($total_horas, 2),
            'carga_por_docente' => $carga_docentes_formateada,
            'carga_por_aula' => $carga_aulas_formateada
        ]);
    }
}
