<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\DocenteGrupoMateria;
use Illuminate\Http\Request;

class ValidacionAsistenciaController extends Controller
{
    /**
     * CU14: Validar registros de asistencia
     * Obtiene la validación de asistencias por docente, grupo, materia y gestión
     */
    public function validarAsistencias(Request $request)
    {
        $validated = $request->validate([
            'id_asignacion' => 'required|integer|exists:DocenteGrupoMateria,id_asignacion',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after_or_equal:fecha_inicio'
        ]);

        $query = Asistencia::where('id_asignacion', $validated['id_asignacion']);

        if ($request->has('fecha_inicio')) {
            $query->where('fecha', '>=', $validated['fecha_inicio']);
        }

        if ($request->has('fecha_fin')) {
            $query->where('fecha', '<=', $validated['fecha_fin']);
        }

        $asistencias = $query->get();
        $total = $asistencias->count();
        $presentes = $asistencias->where('estado', 'PRESENTE')->count();
        $ausentes = $asistencias->where('estado', 'AUSENTE')->count();
        $atrasos = $asistencias->where('estado', 'ATRASO')->count();
        $justificados = $asistencias->where('estado', 'JUSTIFICADO')->count();

        $porcentaje_asistencia = $total > 0 ? ($presentes / $total) * 100 : 0;

        return response()->json([
            'id_asignacion' => $validated['id_asignacion'],
            'total_registros' => $total,
            'presentes' => $presentes,
            'ausentes' => $ausentes,
            'atrasos' => $atrasos,
            'justificados' => $justificados,
            'porcentaje_asistencia' => round($porcentaje_asistencia, 2),
            'detalles' => $asistencias
        ]);
    }

    /**
     * Validar asistencia por rango de fechas y agrupar por docente
     */
    public function validarAsistenciasPorDocente(Request $request)
    {
        $validated = $request->validate([
            'cod_docente' => 'required|integer|exists:Docente,cod_docente',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        // Obtener todas las asignaciones del docente
        $asignaciones = DocenteGrupoMateria::where('cod_docente', $validated['cod_docente'])
            ->with(['grupo', 'materia', 'gestion'])
            ->get();

        $resumen = [];
        foreach ($asignaciones as $asignacion) {
            $asistencias = Asistencia::where('id_asignacion', $asignacion->id_asignacion)
                ->whereBetween('fecha', [$validated['fecha_inicio'], $validated['fecha_fin']])
                ->get();

            $total = $asistencias->count();
            $presentes = $asistencias->where('estado', 'PRESENTE')->count();
            $ausentes = $asistencias->where('estado', 'AUSENTE')->count();
            $porcentaje = $total > 0 ? ($presentes / $total) * 100 : 0;

            $resumen[] = [
                'id_asignacion' => $asignacion->id_asignacion,
                'grupo' => $asignacion->grupo->nombre,
                'materia' => $asignacion->materia->sigla,
                'gestion' => $asignacion->gestion->anio . ' - ' . $asignacion->gestion->periodo,
                'total' => $total,
                'presentes' => $presentes,
                'ausentes' => $ausentes,
                'porcentaje_asistencia' => round($porcentaje, 2)
            ];
        }

        return response()->json([
            'cod_docente' => $validated['cod_docente'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin' => $validated['fecha_fin'],
            'asignaciones' => $resumen
        ]);
    }
}
