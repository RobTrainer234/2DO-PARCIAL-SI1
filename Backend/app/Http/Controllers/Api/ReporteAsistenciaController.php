<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\DocenteGrupoMateria;
use App\Models\Gestion;
use Illuminate\Http\Request;

class ReporteAsistenciaController extends Controller
{
    /**
     * CU16: Generar reporte de asistencia
     * Reporte detallado de asistencia por asignación y rango de fechas
     */
    public function reporteAsistenciaAsignacion(Request $request)
    {
        $validated = $request->validate([
            'id_asignacion' => 'required|integer|exists:DocenteGrupoMateria,id_asignacion',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after_or_equal:fecha_inicio'
        ]);

        $asignacion = DocenteGrupoMateria::with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->findOrFail($validated['id_asignacion']);

        $query = Asistencia::where('id_asignacion', $validated['id_asignacion']);

        if ($request->has('fecha_inicio')) {
            $query->where('fecha', '>=', $validated['fecha_inicio']);
        }

        if ($request->has('fecha_fin')) {
            $query->where('fecha', '<=', $validated['fecha_fin']);
        }

        $asistencias = $query->orderBy('fecha')->get();

        $total = $asistencias->count();
        $presentes = $asistencias->where('estado', 'PRESENTE')->count();
        $ausentes = $asistencias->where('estado', 'AUSENTE')->count();
        $atrasos = $asistencias->where('estado', 'ATRASO')->count();
        $justificados = $asistencias->where('estado', 'JUSTIFICADO')->count();

        $porcentaje_asistencia = $total > 0 ? ($presentes / $total) * 100 : 0;

        return response()->json([
            'docente' => $asignacion->docente->usuario->nombre,
            'grupo' => $asignacion->grupo->nombre,
            'materia' => $asignacion->materia->sigla . ' - ' . $asignacion->materia->nombre,
            'gestion' => $asignacion->gestion->anio . ' - ' . $asignacion->gestion->periodo,
            'fecha_inicio' => $request->fecha_inicio ?? 'Sin especificar',
            'fecha_fin' => $request->fecha_fin ?? 'Sin especificar',
            'estadisticas' => [
                'total_registros' => $total,
                'presentes' => $presentes,
                'ausentes' => $ausentes,
                'atrasos' => $atrasos,
                'justificados' => $justificados,
                'porcentaje_asistencia' => round($porcentaje_asistencia, 2)
            ],
            'detalles' => $asistencias->map(function ($a) {
                return [
                    'fecha' => $a->fecha,
                    'hora' => $a->hora,
                    'estado' => $a->estado,
                    'metodo' => $a->metodo,
                    'observacion' => $a->observacion
                ];
            })
        ]);
    }

    /**
     * Generar reporte de asistencia por docente en un periodo
     */
    public function reporteAsistenciaDocente(Request $request)
    {
        $validated = $request->validate([
            'cod_docente' => 'required|integer|exists:Docente,cod_docente',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio'
        ]);

        $asignaciones = DocenteGrupoMateria::where('cod_docente', $validated['cod_docente'])
            ->with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->get();

        $resumen_general = [
            'total_registros' => 0,
            'presentes' => 0,
            'ausentes' => 0,
            'atrasos' => 0,
            'justificados' => 0
        ];

        $detalles_asignaciones = [];

        foreach ($asignaciones as $asignacion) {
            $asistencias = Asistencia::where('id_asignacion', $asignacion->id_asignacion)
                ->whereBetween('fecha', [$validated['fecha_inicio'], $validated['fecha_fin']])
                ->get();

            $total = $asistencias->count();
            $presentes = $asistencias->where('estado', 'PRESENTE')->count();
            $ausentes = $asistencias->where('estado', 'AUSENTE')->count();
            $atrasos = $asistencias->where('estado', 'ATRASO')->count();
            $justificados = $asistencias->where('estado', 'JUSTIFICADO')->count();
            $porcentaje = $total > 0 ? ($presentes / $total) * 100 : 0;

            $resumen_general['total_registros'] += $total;
            $resumen_general['presentes'] += $presentes;
            $resumen_general['ausentes'] += $ausentes;
            $resumen_general['atrasos'] += $atrasos;
            $resumen_general['justificados'] += $justificados;

            if ($total > 0) {
                $detalles_asignaciones[] = [
                    'grupo' => $asignacion->grupo->nombre,
                    'materia' => $asignacion->materia->sigla,
                    'gestion' => $asignacion->gestion->anio . ' - ' . $asignacion->gestion->periodo,
                    'total_registros' => $total,
                    'presentes' => $presentes,
                    'ausentes' => $ausentes,
                    'atrasos' => $atrasos,
                    'justificados' => $justificados,
                    'porcentaje_asistencia' => round($porcentaje, 2)
                ];
            }
        }

        $porcentaje_total = $resumen_general['total_registros'] > 0 
            ? ($resumen_general['presentes'] / $resumen_general['total_registros']) * 100 
            : 0;

        return response()->json([
            'docente' => $asignaciones->first()?->docente->usuario->nombre ?? 'No encontrado',
            'periodo' => $validated['fecha_inicio'] . ' a ' . $validated['fecha_fin'],
            'resumen_general' => [
                'total_registros' => $resumen_general['total_registros'],
                'presentes' => $resumen_general['presentes'],
                'ausentes' => $resumen_general['ausentes'],
                'atrasos' => $resumen_general['atrasos'],
                'justificados' => $resumen_general['justificados'],
                'porcentaje_asistencia' => round($porcentaje_total, 2)
            ],
            'detalles_por_asignacion' => $detalles_asignaciones
        ]);
    }

    /**
     * Generar reporte de asistencia por gestión
     */
    public function reporteAsistenciaGestion(Request $request)
    {
        $validated = $request->validate([
            'id_gestion' => 'required|integer|exists:Gestion,id_gestion'
        ]);

        $gestion = Gestion::findOrFail($validated['id_gestion']);
        $asignaciones = DocenteGrupoMateria::where('id_gestion', $validated['id_gestion'])
            ->with(['docente.usuario', 'grupo', 'materia'])
            ->get();

        $resumen = [];
        foreach ($asignaciones as $asignacion) {
            $asistencias = Asistencia::where('id_asignacion', $asignacion->id_asignacion)->get();

            $total = $asistencias->count();
            $presentes = $asistencias->where('estado', 'PRESENTE')->count();
            $porcentaje = $total > 0 ? ($presentes / $total) * 100 : 0;

            if ($total > 0) {
                $resumen[] = [
                    'docente' => $asignacion->docente->usuario->nombre,
                    'grupo' => $asignacion->grupo->nombre,
                    'materia' => $asignacion->materia->sigla,
                    'total_registros' => $total,
                    'presentes' => $presentes,
                    'ausentes' => $asistencias->where('estado', 'AUSENTE')->count(),
                    'porcentaje_asistencia' => round($porcentaje, 2)
                ];
            }
        }

        return response()->json([
            'gestion' => $gestion->anio . ' - ' . $gestion->periodo,
            'resumen_asignaciones' => $resumen
        ]);
    }
}
