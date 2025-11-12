<?php

namespace App\Services;

use App\Models\Horarios;
use Illuminate\Support\Carbon;

class ScheduleConflictService
{
    /**
     * Check for schedule conflicts for the given parameters.
     * Returns an array with 'conflict' => bool and 'message' => string when conflict true.
     */
    public function checkConflict(array $data): array
    {
        // expected keys: dia, hora_inicio, hora_final, id_asignacion, id_infraestructura
        $dia = $data['dia'];
        $inicio = $data['hora_inicio'];
        $final = $data['hora_final'];
        $idAsignacion = $data['id_asignacion'] ?? null;
        $idInfra = $data['id_infraestructura'] ?? null;

        // Normalize times
        $tInicio = Carbon::parse($inicio)->format('H:i:s');
        $tFinal = Carbon::parse($final)->format('H:i:s');

        // Query existing horarios on same day that overlap the time window
        $query = Horarios::where('dia', $dia)
            ->where(function ($q) use ($tInicio, $tFinal) {
                $q->whereBetween('hora_inicio', [$tInicio, $tFinal])
                  ->orWhereBetween('hora_final', [$tInicio, $tFinal])
                  ->orWhereRaw("hora_inicio <= ? AND hora_final >= ?", [$tInicio, $tFinal]);
            });

        // If infra specified, check conflicts in same infra
        if ($idInfra) {
            $qInfra = (clone $query)->where('id_infraestructura', $idInfra)->exists();
            if ($qInfra) {
                return ['conflict' => true, 'message' => 'Conflicto: la infraestructura ya está ocupada en ese horario'];
            }
        }

        // Check conflicts for same docente or grupo via asignacion
        if ($idAsignacion) {
            // find docente and grupo for this asignacion
            $asig = \App\Models\DocenteGrupoMateria::find($idAsignacion);
            if ($asig) {
                $codDoc = $asig->cod_docente;
                $idGrupo = $asig->id_grupo;

                // horarios that link to asignaciones with same docente
                $existsDoc = Horarios::where('dia', $dia)
                    ->whereHas('asignacion', function ($q) use ($codDoc) {
                        $q->where('cod_docente', $codDoc);
                    })
                    ->where(function ($q) use ($tInicio, $tFinal) {
                        $q->whereBetween('hora_inicio', [$tInicio, $tFinal])
                          ->orWhereBetween('hora_final', [$tInicio, $tFinal])
                          ->orWhereRaw("hora_inicio <= ? AND hora_final >= ?", [$tInicio, $tFinal]);
                    })->exists();

                if ($existsDoc) {
                    return ['conflict' => true, 'message' => 'Conflicto: el docente tiene otro horario en ese periodo'];
                }

                $existsGrupo = Horarios::where('dia', $dia)
                    ->whereHas('asignacion', function ($q) use ($idGrupo) {
                        $q->where('id_grupo', $idGrupo);
                    })
                    ->where(function ($q) use ($tInicio, $tFinal) {
                        $q->whereBetween('hora_inicio', [$tInicio, $tFinal])
                          ->orWhereBetween('hora_final', [$tInicio, $tFinal])
                          ->orWhereRaw("hora_inicio <= ? AND hora_final >= ?", [$tInicio, $tFinal]);
                    })->exists();

                if ($existsGrupo) {
                    return ['conflict' => true, 'message' => 'Conflicto: el grupo tiene otro horario en ese periodo'];
                }
            }
        }

        return ['conflict' => false];
    }
}
