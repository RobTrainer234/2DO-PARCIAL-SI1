<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditoriaController extends Controller
{
    /**
     * CU21: Obtener bitácora de auditoría (paginada)
     */
    public function obtenerBitacora(Request $request)
    {
        try {
            $request->validate([
                'pagina' => 'integer|min:1',
                'por_pagina' => 'integer|min:1|max:100',
                'usuario_id' => 'integer',
                'entidad' => 'string',
                'accion' => 'string',
                'fecha_desde' => 'date',
                'fecha_hasta' => 'date',
            ]);

            $query = AuditLog::query();

            // Filtros
            if ($request->has('usuario_id') && $request->usuario_id) {
                $query->where('usuario_id', $request->usuario_id);
            }

            if ($request->has('entidad') && $request->entidad) {
                $query->where('entidad', 'like', '%' . $request->entidad . '%');
            }

            if ($request->has('accion') && $request->accion) {
                $query->where('accion', 'like', '%' . $request->accion . '%');
            }

            if ($request->has('fecha_desde') && $request->fecha_desde) {
                $query->whereDate('creado_en', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta') && $request->fecha_hasta) {
                $query->whereDate('creado_en', '<=', $request->fecha_hasta);
            }

            $pagina = $request->input('pagina', 1);
            $porPagina = $request->input('por_pagina', 20);

            $bitacora = $query->orderByDesc('creado_en')
                ->paginate($porPagina, ['*'], 'page', $pagina);

            return response()->json([
                'success' => true,
                'data' => $bitacora->items(),
                'paginacion' => [
                    'total' => $bitacora->total(),
                    'pagina' => $bitacora->currentPage(),
                    'por_pagina' => $bitacora->perPage(),
                    'total_paginas' => $bitacora->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener bitácora: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU21: Obtener estadísticas de auditoría
     */
    public function estadisticasAuditoria(Request $request)
    {
        try {
            // Total de registros por acción
            $registrosPorAccion = AuditLog::selectRaw('
                accion,
                COUNT(*) as total
            ')
                ->groupBy('accion')
                ->orderByDesc('total')
                ->get();

            // Total de registros por entidad
            $registrosPorEntidad = AuditLog::selectRaw('
                entidad,
                COUNT(*) as total
            ')
                ->groupBy('entidad')
                ->orderByDesc('total')
                ->get();

            // Usuarios más activos
            $usuariosMasActivos = AuditLog::selectRaw('
                usuario_id,
                COUNT(*) as total_acciones
            ')
                ->groupBy('usuario_id')
                ->orderByDesc('total_acciones')
                ->limit(10)
                ->get();

            // Últimas acciones (últimas 24 horas)
            $ultimasAcciones = AuditLog::whereRaw('creado_en >= NOW() - INTERVAL 24 HOUR')
                ->selectRaw('
                    accion,
                    COUNT(*) as total
                ')
                ->groupBy('accion')
                ->get();

            // Total general
            $totalRegistros = AuditLog::count();
            $totalUsuarios = AuditLog::distinct('usuario_id')->count();

            return response()->json([
                'success' => true,
                'estadisticas' => [
                    'total_registros' => $totalRegistros,
                    'total_usuarios' => $totalUsuarios,
                    'registros_por_accion' => $registrosPorAccion,
                    'registros_por_entidad' => $registrosPorEntidad,
                    'usuarios_mas_activos' => $usuariosMasActivos,
                    'ultimas_24_horas' => $ultimasAcciones
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU21: Obtener detalles de cambio en un registro de auditoría
     */
    public function obtenerDetalleAuditoria($id)
    {
        try {
            $auditLog = AuditLog::find($id);

            if (!$auditLog) {
                return response()->json([
                    'success' => false,
                    'message' => 'Registro de auditoría no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'auditoria' => [
                    'id' => $auditLog->id,
                    'usuario_id' => $auditLog->usuario_id,
                    'accion' => $auditLog->accion,
                    'entidad' => $auditLog->entidad,
                    'entidad_id' => $auditLog->entidad_id,
                    'antes' => $auditLog->antes,
                    'despues' => $auditLog->despues,
                    'ip' => $auditLog->ip,
                    'user_agent' => $auditLog->user_agent,
                    'creado_en' => $auditLog->creado_en,
                    'cambios' => $this->extraerCambios($auditLog->antes, $auditLog->despues)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalles: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU21: Exportar bitácora a CSV
     */
    public function exportarBitacoraCSV(Request $request)
    {
        try {
            $query = AuditLog::query();

            if ($request->has('usuario_id') && $request->usuario_id) {
                $query->where('usuario_id', $request->usuario_id);
            }

            if ($request->has('entidad') && $request->entidad) {
                $query->where('entidad', 'like', '%' . $request->entidad . '%');
            }

            if ($request->has('accion') && $request->accion) {
                $query->where('accion', 'like', '%' . $request->accion . '%');
            }

            $bitacora = $query->orderByDesc('creado_en')->get();

            $csv = "Usuario ID;Acción;Entidad;Entidad ID;Fecha;IP\n";

            foreach ($bitacora as $registro) {
                $csv .= implode(';', [
                    $registro->usuario_id,
                    $registro->accion,
                    $registro->entidad,
                    $registro->entidad_id,
                    $registro->creado_en,
                    $registro->ip
                ]) . "\n";
            }

            return response()->json([
                'success' => true,
                'message' => 'CSV exportado correctamente',
                'data' => [
                    'filename' => 'bitacora_' . now()->format('Y-m-d_H-i-s') . '.csv',
                    'rows' => count($bitacora),
                    'content' => base64_encode($csv)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Método privado para extraer los cambios realizados
     */
    private function extraerCambios($antes, $despues)
    {
        $cambios = [];

        if (!$antes || !$despues) {
            return $cambios;
        }

        $antes = is_array($antes) ? $antes : json_decode($antes, true) ?? [];
        $despues = is_array($despues) ? $despues : json_decode($despues, true) ?? [];

        foreach ($despues as $campo => $valor) {
            $valorAntes = $antes[$campo] ?? null;
            if ($valorAntes !== $valor) {
                $cambios[] = [
                    'campo' => $campo,
                    'antes' => $valorAntes,
                    'despues' => $valor
                ];
            }
        }

        return $cambios;
    }
}
