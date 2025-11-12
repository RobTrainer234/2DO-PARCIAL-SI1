<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Horarios;
use App\Models\DocenteGrupoMateria;
use Illuminate\Http\Request;

class ConsultaHorarioController extends Controller
{
    /**
     * CU15: Consultar horario de una asignación
     * Obtiene todos los horarios de una asignación docente-grupo-materia
     */
    public function consultarHorarioAsignacion($id_asignacion)
    {
        $asignacion = DocenteGrupoMateria::with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->findOrFail($id_asignacion);

        $horarios = Horarios::where('id_asignacion', $id_asignacion)
            ->with('infraestructura.tipo')
            ->orderByRaw("CASE 
                WHEN dia = 'Lunes' THEN 1
                WHEN dia = 'Martes' THEN 2
                WHEN dia = 'Miércoles' THEN 3
                WHEN dia = 'Jueves' THEN 4
                WHEN dia = 'Viernes' THEN 5
                WHEN dia = 'Sábado' THEN 6
                WHEN dia = 'Domingo' THEN 7
                END")
            ->orderBy('hora_inicio')
            ->get();

        return response()->json([
            'asignacion' => $asignacion,
            'horarios' => $horarios
        ]);
    }

    /**
     * Consultar horario por docente
     */
    public function consultarHorarioDocente($cod_docente)
    {
        $asignaciones = DocenteGrupoMateria::where('cod_docente', $cod_docente)
            ->with(['grupo', 'materia', 'gestion'])
            ->get();

        $horarios_agrupados = [];
        foreach ($asignaciones as $asignacion) {
            $horarios = Horarios::where('id_asignacion', $asignacion->id_asignacion)
                ->with('infraestructura.tipo')
                ->orderByRaw("CASE 
                    WHEN dia = 'Lunes' THEN 1
                    WHEN dia = 'Martes' THEN 2
                    WHEN dia = 'Miércoles' THEN 3
                    WHEN dia = 'Jueves' THEN 4
                    WHEN dia = 'Viernes' THEN 5
                    WHEN dia = 'Sábado' THEN 6
                    WHEN dia = 'Domingo' THEN 7
                    END")
                ->orderBy('hora_inicio')
                ->get();

            if ($horarios->count() > 0) {
                $horarios_agrupados[] = [
                    'asignacion' => $asignacion,
                    'horarios' => $horarios
                ];
            }
        }

        return response()->json([
            'cod_docente' => $cod_docente,
            'horarios_por_asignacion' => $horarios_agrupados
        ]);
    }

    /**
     * Consultar horario por grupo
     */
    public function consultarHorarioGrupo($id_grupo)
    {
        $asignaciones = DocenteGrupoMateria::where('id_grupo', $id_grupo)
            ->with(['docente.usuario', 'materia', 'gestion'])
            ->get();

        $horarios_agrupados = [];
        foreach ($asignaciones as $asignacion) {
            $horarios = Horarios::where('id_asignacion', $asignacion->id_asignacion)
                ->with('infraestructura.tipo')
                ->orderByRaw("CASE 
                    WHEN dia = 'Lunes' THEN 1
                    WHEN dia = 'Martes' THEN 2
                    WHEN dia = 'Miércoles' THEN 3
                    WHEN dia = 'Jueves' THEN 4
                    WHEN dia = 'Viernes' THEN 5
                    WHEN dia = 'Sábado' THEN 6
                    WHEN dia = 'Domingo' THEN 7
                    END")
                ->orderBy('hora_inicio')
                ->get();

            if ($horarios->count() > 0) {
                $horarios_agrupados[] = [
                    'asignacion' => $asignacion,
                    'horarios' => $horarios
                ];
            }
        }

        return response()->json([
            'id_grupo' => $id_grupo,
            'horarios_por_asignacion' => $horarios_agrupados
        ]);
    }
}
