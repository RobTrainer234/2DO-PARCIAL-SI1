<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Horarios;
use App\Models\DocenteGrupoMateria;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class HorarioController extends Controller
{
    /**
     * CU11 & CU12: Listar horarios con filtros opcionales
     */
    public function index(Request $request)
    {
        $query = Horarios::with(['asignacion', 'infraestructura']);

        // Filtros opcionales
        if ($request->has('dia')) {
            $query->where('dia', $request->dia);
        }

        if ($request->has('infraestructura_id')) {
            $query->where('id_infraestructura', $request->infraestructura_id);
        }

        if ($request->has('asignacion_id')) {
            $query->where('id_asignacion', $request->asignacion_id);
        }

        return $query->paginate(30);
    }

    /**
     * CU11: Registrar horario con validación de conflictos (3 tipos)
     */
    public function store(Request $request)
    {
        try {
            // Validación de entrada
            $data = $request->validate([
                'dia' => 'required|string|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
                'hora_inicio' => 'required|date_format:H:i',
                'hora_final' => 'required|date_format:H:i|after:hora_inicio',
                'id_asignacion' => 'required|integer|exists:DocenteGrupoMateria,id_asignacion',
                'id_infraestructura' => 'required|integer|exists:Infraestructura,id_infraestructura'
            ]);

            // Obtener la asignación para verificar que existe
            $asignacion = DocenteGrupoMateria::findOrFail($data['id_asignacion']);

            // Verificar conflictos (3 tipos: docente, aula, grupo)
            $conflicto = $this->verificarConflictos($data, $asignacion);

            if ($conflicto) {
                return response()->json([
                    'message' => 'Conflicto: ' . $conflicto['mensaje'],
                    'tipo_conflicto' => $conflicto['tipo'],
                    'detalles' => $conflicto['detalles'] ?? []
                ], 422);
            }

            // Crear el horario
            DB::beginTransaction();

            $horario = Horarios::create($data);

            // Registrar auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'crear',
                'entidad' => 'Horarios',
                'entidad_id' => $horario->id_horario,
                'antes' => null,
                'despues' => $horario->toArray(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Horario registrado exitosamente',
                'horario' => $horario->load(['asignacion', 'infraestructura'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear horario: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al registrar horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar múltiples horarios (útil para crear horarios de una materia completa)
     */
    public function storeMultiple(Request $request)
    {
        try {
            $data = $request->validate([
                'horarios' => 'required|array|min:1',
                'horarios.*.dia' => 'required|string|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
                'horarios.*.hora_inicio' => 'required|date_format:H:i',
                'horarios.*.hora_final' => 'required|date_format:H:i|after:horarios.*.hora_inicio',
                'horarios.*.id_asignacion' => 'required|integer|exists:DocenteGrupoMateria,id_asignacion',
                'horarios.*.id_infraestructura' => 'required|integer|exists:Infraestructura,id_infraestructura'
            ]);

            DB::beginTransaction();

            $exitosos = [];
            $errores = [];

            foreach ($data['horarios'] as $index => $horarioData) {
                try {
                    $asignacion = DocenteGrupoMateria::findOrFail($horarioData['id_asignacion']);
                    $conflicto = $this->verificarConflictos($horarioData, $asignacion);

                    if ($conflicto) {
                        $errores[$index] = [
                            'mensaje' => $conflicto['mensaje'],
                            'tipo' => $conflicto['tipo']
                        ];
                        continue;
                    }

                    $horario = Horarios::create($horarioData);
                    $exitosos[] = $horario;

                    // Auditoría
                    AuditLog::create([
                        'usuario_id' => Auth::id(),
                        'accion' => 'crear',
                        'entidad' => 'Horarios',
                        'entidad_id' => $horario->id_horario,
                        'antes' => null,
                        'despues' => $horario->toArray(),
                        'ip' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);

                } catch (\Exception $e) {
                    $errores[$index] = ['mensaje' => $e->getMessage()];
                }
            }

            DB::commit();

            $status = empty($errores) ? 201 : 207; // 201 = Created, 207 = Multi-Status

            return response()->json([
                'message' => count($exitosos) . ' horarios creados exitosamente',
                'exitosos' => count($exitosos),
                'con_error' => count($errores),
                'horarios' => $exitosos,
                'errores' => $errores
            ], $status);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al crear múltiples horarios: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al procesar múltiples horarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU11: Consultar horarios de un docente
     */
    public function getDocenteHorarios($docenteId)
    {
        $horarios = Horarios::whereHas('asignacion', function ($query) use ($docenteId) {
            $query->where('cod_docente', $docenteId);
        })
        ->with(['asignacion', 'infraestructura'])
        ->get();

        return response()->json($horarios);
    }

    /**
     * CU11: Consultar horarios de un grupo
     */
    public function getGrupoHorarios($grupoId)
    {
        $horarios = Horarios::whereHas('asignacion', function ($query) use ($grupoId) {
            $query->where('id_grupo', $grupoId);
        })
        ->with(['asignacion', 'infraestructura'])
        ->get();

        return response()->json($horarios);
    }

    /**
     * CU11: Consultar horarios de un aula
     */
    public function getAulaHorarios($aulaId)
    {
        $horarios = Horarios::where('id_infraestructura', $aulaId)
            ->with(['asignacion', 'infraestructura'])
            ->get();

        return response()->json($horarios);
    }

    /**
     * CU12: Mostrar un horario específico
     */
    public function show($id)
    {
        $horario = Horarios::with(['asignacion', 'infraestructura'])->findOrFail($id);
        return response()->json($horario);
    }

    /**
     * CU12: Actualizar horario con validación de conflictos
     */
    public function update(Request $request, $id)
    {
        try {
            $horario = Horarios::findOrFail($id);
            $horarioOriginal = $horario->toArray();

            $data = $request->validate([
                'dia' => 'sometimes|string|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
                'hora_inicio' => 'sometimes|date_format:H:i',
                'hora_final' => 'sometimes|date_format:H:i',
                'id_infraestructura' => 'sometimes|integer|exists:Infraestructura,id_infraestructura'
            ]);

            // Preparar datos para validación
            $datosValidar = array_merge([
                'dia' => $horario->dia,
                'hora_inicio' => $horario->hora_inicio,
                'hora_final' => $horario->hora_final,
                'id_asignacion' => $horario->id_asignacion,
                'id_infraestructura' => $horario->id_infraestructura
            ], $data);

            // Verificar conflictos (excluyendo el horario actual)
            $asignacion = $horario->asignacion;
            $conflicto = $this->verificarConflictos($datosValidar, $asignacion, $horario->id_horario);

            if ($conflicto) {
                return response()->json([
                    'message' => 'Conflicto: ' . $conflicto['mensaje'],
                    'tipo_conflicto' => $conflicto['tipo']
                ], 422);
            }

            DB::beginTransaction();

            $horario->update($data);

            // Auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'actualizar',
                'entidad' => 'Horarios',
                'entidad_id' => $horario->id_horario,
                'antes' => $horarioOriginal,
                'despues' => $horario->toArray(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Horario actualizado exitosamente',
                'horario' => $horario->load(['asignacion', 'infraestructura'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar horario: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * CU12: Eliminar horario (soft delete)
     */
    public function destroy(Request $request, $id)
    {
        try {
            $horario = Horarios::findOrFail($id);
            $horarioOriginal = $horario->toArray();

            DB::beginTransaction();

            $horario->delete();

            // Auditoría
            AuditLog::create([
                'usuario_id' => Auth::id(),
                'accion' => 'eliminar',
                'entidad' => 'Horarios',
                'entidad_id' => $horario->id_horario,
                'antes' => $horarioOriginal,
                'despues' => null,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            DB::commit();

            return response()->json(['message' => 'Horario eliminado exitosamente']);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al eliminar horario: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * PRIVADO: Verificar conflictos de horario (docente, aula, grupo)
     *
     * @param array $datosHorario Datos del horario a crear/actualizar
     * @param DocenteGrupoMateria $asignacion Asignación actual
     * @param int|null $idHorarioActual ID del horario actual (para excluir en búsqueda)
     * @return array|null Retorna info del conflicto o null si no hay conflicto
     */
    private function verificarConflictos($datosHorario, $asignacion, $idHorarioActual = null)
    {
        $dia = $datosHorario['dia'];
        $horaInicio = $datosHorario['hora_inicio'];
        $horaFinal = $datosHorario['hora_final'];
        $idAsignacion = $datosHorario['id_asignacion'];
        $idInfraestructura = $datosHorario['id_infraestructura'];

        $query = Horarios::where('dia', $dia)
            ->whereTime('hora_inicio', '<', $horaFinal)
            ->whereTime('hora_final', '>', $horaInicio);

        if ($idHorarioActual) {
            $query->where('id_horario', '!=', $idHorarioActual);
        }

        $horariosDelDia = $query->get();

        if ($horariosDelDia->isEmpty()) {
            return null; // Sin conflictos
        }

        // Verificar conflicto de DOCENTE
        $conflictoDocente = $horariosDelDia->filter(function ($h) use ($asignacion) {
            return $h->asignacion && $h->asignacion->cod_docente === $asignacion->cod_docente;
        })->first();

        if ($conflictoDocente) {
            return [
                'tipo' => 'docente',
                'mensaje' => 'El docente ' . $asignacion->docente->nombre 
                    . ' ya tiene clase en este horario (' . $conflictoDocente->hora_inicio . '-' . $conflictoDocente->hora_final . ')',
                'detalles' => [
                    'docente' => $asignacion->docente->nombre,
                    'horario_conflicto' => $conflictoDocente->hora_inicio . '-' . $conflictoDocente->hora_final
                ]
            ];
        }

        // Verificar conflicto de AULA
        $conflictoAula = $horariosDelDia->filter(function ($h) use ($idInfraestructura) {
            return $h->id_infraestructura === $idInfraestructura;
        })->first();

        if ($conflictoAula) {
            return [
                'tipo' => 'aula',
                'mensaje' => 'El aula ' . ($conflictoAula->infraestructura->nro ?? 'N/A')
                    . ' ya está ocupada en este horario (' . $conflictoAula->hora_inicio . '-' . $conflictoAula->hora_final . ')',
                'detalles' => [
                    'aula' => $conflictoAula->infraestructura->nro ?? 'N/A',
                    'horario_conflicto' => $conflictoAula->hora_inicio . '-' . $conflictoAula->hora_final
                ]
            ];
        }

        // Verificar conflicto de GRUPO
        $conflictoGrupo = $horariosDelDia->filter(function ($h) use ($asignacion) {
            return $h->asignacion && $h->asignacion->id_grupo === $asignacion->id_grupo;
        })->first();

        if ($conflictoGrupo) {
            return [
                'tipo' => 'grupo',
                'mensaje' => 'El grupo ' . $asignacion->grupo->nombre
                    . ' ya tiene clase en este horario (' . $conflictoGrupo->hora_inicio . '-' . $conflictoGrupo->hora_final . ')',
                'detalles' => [
                    'grupo' => $asignacion->grupo->nombre,
                    'horario_conflicto' => $conflictoGrupo->hora_inicio . '-' . $conflictoGrupo->hora_final
                ]
            ];
        }

        return null; // Sin conflictos
    }
}
