<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AsistenciaController extends Controller
{
    /**
     * CU14: Listar asistencias para validación (para coordinador)
     * GET /api/asistencias?estado=pendiente&docente_id=1&fecha_desde=2025-01-01
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Asistencia::with(['estudiante:id,nombre,apellido', 'docente:id,nombre,apellido', 'horario.materia:id,sigla,nombre', 'horario.grupo:id,sigla']);

            // Filtros
            if ($request->filled('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->filled('docente_id')) {
                $query->where('docente_id', $request->docente_id);
            }

            if ($request->filled('fecha_desde')) {
                $query->whereDate('fecha', '>=', $request->fecha_desde);
            }

            if ($request->filled('fecha_hasta')) {
                $query->whereDate('fecha', '<=', $request->fecha_hasta);
            }

            if ($request->filled('grupo_id')) {
                $query->whereHas('horario', fn($q) => $q->where('grupo_id', $request->grupo_id));
            }

            if ($request->filled('materia_id')) {
                $query->whereHas('horario', fn($q) => $q->where('materia_id', $request->materia_id));
            }

            $asistencias = $query->orderBy('fecha', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $asistencias,
                'message' => 'Asistencias obtenidas exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener asistencias: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU14: Validar una asistencia (cambiar estado, agregar observaciones)
     * PUT /api/asistencias/{id}/validar
     */
    public function validar(Request $request, int $id): JsonResponse
    {
        try {
            $request->validate([
                'validado' => 'required|boolean',
                'observaciones' => 'nullable|string|max:500',
                'justificacion_falta' => 'nullable|string|max:500',
            ]);

            $asistencia = Asistencia::findOrFail($id);
            $estado_anterior = $asistencia->estado;

            DB::beginTransaction();

            // Actualizar asistencia
            $asistencia->update([
                'validado' => $request->validado,
                'observaciones' => $request->observaciones,
                'justificacion_falta' => $request->justificacion_falta,
                'estado' => $request->validado ? 'validado' : 'rechazado',
                'validado_por' => Auth::id(),
                'fecha_validacion' => now(),
            ]);

            // Registrar en auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'validar_asistencia',
                'tabla' => 'Asistencia',
                'registro_id' => $id,
                'cambios' => json_encode([
                    'estado' => $estado_anterior . ' → ' . $asistencia->estado,
                    'validado' => $request->validado,
                    'observaciones' => $request->observaciones,
                    'justificacion_falta' => $request->justificacion_falta,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $asistencia->load(['estudiante', 'docente', 'horario']),
                'message' => 'Asistencia validada exitosamente'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validación fallida',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al validar asistencia: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU14: Obtener histórico de validaciones de una asistencia
     * GET /api/asistencias/{id}/historico-validaciones
     */
    public function historicoValidaciones(int $id): JsonResponse
    {
        try {
            $asistencia = Asistencia::findOrFail($id);

            $historico = AuditLog::where('tabla', 'Asistencia')
                ->where('registro_id', $id)
                ->where('accion', 'validar_asistencia')
                ->with('usuario:id,nombre,apellido')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($log) => [
                    'validado_por' => $log->usuario->nombre . ' ' . $log->usuario->apellido,
                    'fecha' => $log->created_at,
                    'cambios' => json_decode($log->cambios, true),
                ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'asistencia' => $asistencia,
                    'historico' => $historico
                ],
                'message' => 'Histórico obtenido exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener histórico: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU14: Registrar asistencia (desde docente)
     * POST /api/asistencias
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'horario_id' => 'required|exists:Horarios,id',
                'estudiante_id' => 'required|exists:Usuario,id',
                'asistio' => 'required|boolean',
                'observaciones' => 'nullable|string|max:500',
            ]);

            $asistencia = Asistencia::create([
                'horario_id' => $request->horario_id,
                'estudiante_id' => $request->estudiante_id,
                'docente_id' => Auth::id(),
                'asistio' => $request->asistio,
                'observaciones' => $request->observaciones,
                'fecha' => now()->toDateString(),
                'estado' => 'pendiente',
            ]);

            // Auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'crear_asistencia',
                'tabla' => 'Asistencia',
                'registro_id' => $asistencia->id,
                'cambios' => json_encode($asistencia->toArray()),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'success' => true,
                'data' => $asistencia,
                'message' => 'Asistencia registrada exitosamente'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validación fallida',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar asistencia: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU14: Obtener estadísticas de asistencia de un docente
     * GET /api/asistencias/estadisticas/{docente_id}
     */
    public function estadisticas(int $docente_id, Request $request): JsonResponse
    {
        try {
            $fecha_desde = $request->fecha_desde ? Carbon::parse($request->fecha_desde) : Carbon::now()->startOfMonth();
            $fecha_hasta = $request->fecha_hasta ? Carbon::parse($request->fecha_hasta) : Carbon::now()->endOfMonth();

            $asistencias = Asistencia::where('docente_id', $docente_id)
                ->whereBetween('fecha', [$fecha_desde, $fecha_hasta])
                ->get();

            $total = $asistencias->count();
            $presentes = $asistencias->where('asistio', true)->count();
            $ausentes = $asistencias->where('asistio', false)->count();
            $validadas = $asistencias->where('validado', true)->count();
            $pendientes = $asistencias->where('estado', 'pendiente')->count();

            $porcentaje_asistencia = $total > 0 ? round(($presentes / $total) * 100, 2) : 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'periodo' => [
                        'desde' => $fecha_desde->toDateString(),
                        'hasta' => $fecha_hasta->toDateString(),
                    ],
                    'total' => $total,
                    'presentes' => $presentes,
                    'ausentes' => $ausentes,
                    'validadas' => $validadas,
                    'pendientes' => $pendientes,
                    'porcentaje_asistencia' => $porcentaje_asistencia . '%',
                ],
                'message' => 'Estadísticas obtenidas exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU15: Consultar horario (redirigir a HorarioController)
     * Se implementa en HorarioController
     */

    public function show($id)
    {
        return Asistencia::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $a = Asistencia::findOrFail($id);
        $data = $request->validate([
            'estado' => 'sometimes|string',
            'observacion' => 'nullable|string'
        ]);
        $a->update($data);
        return response()->json($a);
    }

    public function destroy($id)
    {
        $a = Asistencia::findOrFail($id);
        $a->delete();
        return response()->json(['message' => 'Asistencia eliminada']);
    }
}
