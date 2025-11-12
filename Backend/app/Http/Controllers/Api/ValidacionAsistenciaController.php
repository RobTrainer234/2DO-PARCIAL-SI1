<?php

namespace App\Http\Controllers\Api;

use App\Models\AsistenciaDocente;
use App\Models\ValidacionAsistencia;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ValidacionAsistenciaController extends Controller
{
    // CU14: Obtener asistencias para validar
    public function obtenerPendientes(Request $request)
    {
        $query = AsistenciaDocente::where('validada', false)
            ->with(['docente', 'grupo', 'evidencias', 'validaciones']);

        if ($request->has('fecha')) {
            $query->where('fecha', $request->fecha);
        }

        if ($request->has('grupo_id')) {
            $query->where('grupo_id', $request->grupo_id);
        }

        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        $asistencias = $query->orderBy('fecha', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $asistencias
        ]);
    }

    // CU14: Validar asistencia
    public function validar(Request $request, $asistenciaId)
    {
        $validated = $request->validate([
            'estado_validacion' => 'required|in:Aprobada,Rechazada,En revisión',
            'observaciones_validacion' => 'nullable|string',
            'falta_justificada' => 'nullable|boolean'
        ]);

        $asistencia = AsistenciaDocente::find($asistenciaId);

        if (!$asistencia) {
            return response()->json(['error' => 'Asistencia no encontrada'], 404);
        }

        // Crear/actualizar registro de validación
        $validacion = ValidacionAsistencia::updateOrCreate(
            ['asistencia_id' => $asistenciaId],
            [
                'coordinador_id' => auth()->id(),
                'estado_validacion' => $validated['estado_validacion'],
                'observaciones_validacion' => $validated['observaciones_validacion'],
                'falta_justificada' => $validated['falta_justificada'] ?? false,
                'fecha_validacion' => now()
            ]
        );

        // Marcar asistencia como validada
        $asistencia->update([
            'validada' => true,
            'validada_por' => auth()->id(),
            'fecha_validacion' => now()
        ]);

        // Si falta justificada, cambiar estado
        if ($validated['falta_justificada'] ?? false) {
            $asistencia->update(['estado' => 'Falta justificada']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Asistencia validada exitosamente',
            'data' => [
                'asistencia' => $asistencia,
                'validacion' => $validacion
            ]
        ]);
    }

    // CU14: Rechazar validación
    public function rechazar(Request $request, $asistenciaId)
    {
        $validated = $request->validate([
            'motivo_rechazo' => 'required|string'
        ]);

        $asistencia = AsistenciaDocente::find($asistenciaId);

        if (!$asistencia) {
            return response()->json(['error' => 'Asistencia no encontrada'], 404);
        }

        ValidacionAsistencia::updateOrCreate(
            ['asistencia_id' => $asistenciaId],
            [
                'coordinador_id' => auth()->id(),
                'estado_validacion' => 'Rechazada',
                'observaciones_validacion' => $validated['motivo_rechazo'],
                'fecha_validacion' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Validación rechazada. Se notificará al docente.',
            'data' => $asistencia
        ]);
    }

    // CU14: Obtener histórico de validaciones
    public function historicoValidaciones($asistenciaId)
    {
        $asistencia = AsistenciaDocente::find($asistenciaId);

        if (!$asistencia) {
            return response()->json(['error' => 'Asistencia no encontrada'], 404);
        }

        $validaciones = ValidacionAsistencia::where('asistencia_id', $asistenciaId)
            ->with('coordinador:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'asistencia' => $asistencia,
            'validaciones' => $validaciones
        ]);
    }

    // CU14: Obtener resumen de validaciones por período
    public function resumenValidaciones(Request $request)
    {
        $fechaInicio = $request->query('fecha_inicio');
        $fechaFin = $request->query('fecha_fin');
        $docenteId = $request->query('docente_id');

        $query = ValidacionAsistencia::with(['asistencia', 'coordinador']);

        if ($fechaInicio && $fechaFin) {
            $query->whereBetween('fecha_validacion', [$fechaInicio, $fechaFin]);
        }

        if ($docenteId) {
            $query->whereHas('asistencia', function ($q) use ($docenteId) {
                $q->where('docente_id', $docenteId);
            });
        }

        $validaciones = $query->get();

        $resumen = [
            'total_validaciones' => $validaciones->count(),
            'aprobadas' => $validaciones->where('estado_validacion', 'Aprobada')->count(),
            'rechazadas' => $validaciones->where('estado_validacion', 'Rechazada')->count(),
            'en_revision' => $validaciones->where('estado_validacion', 'En revisión')->count(),
            'faltas_justificadas' => $validaciones->where('falta_justificada', true)->count(),
            'por_coordinador' => $validaciones->groupBy('coordinador_id')->map(function ($items) {
                return [
                    'coordinador' => $items->first()->coordinador->name ?? 'Desconocido',
                    'total' => $items->count(),
                    'aprobadas' => $items->where('estado_validacion', 'Aprobada')->count()
                ];
            })
        ];

        return response()->json([
            'success' => true,
            'resumen' => $resumen,
            'validaciones' => $validaciones
        ]);
    }

    // CU14: Marcar como revisada
    public function marcarRevisada(Request $request, $asistenciaId)
    {
        $asistencia = AsistenciaDocente::find($asistenciaId);

        if (!$asistencia) {
            return response()->json(['error' => 'Asistencia no encontrada'], 404);
        }

        $asistencia->update([
            'validada' => true,
            'validada_por' => auth()->id(),
            'fecha_validacion' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Marcada como revisada',
            'data' => $asistencia
        ]);
    }
}
