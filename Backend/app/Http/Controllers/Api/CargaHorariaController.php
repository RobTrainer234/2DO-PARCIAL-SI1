<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CargaHorariaDocente;
use App\Models\HorarioDisponibilidad;
use App\Models\Docente;
use App\Models\Materia;
use Illuminate\Support\Facades\DB;

class CargaHorariaController extends Controller
{
    /**
     * Listar todas las cargas horarias
     */
    public function index()
    {
        $cargas = CargaHorariaDocente::with(['docente.usuario', 'materia', 'horarios'])->get();
        
        return response()->json($cargas);
    }

    /**
     * Obtener carga horaria de un docente específico
     */
    public function obtenerCargaDocente($cod_docente)
    {
        $docente = Docente::findOrFail($cod_docente);
        
        $cargas = CargaHorariaDocente::where('cod_docente', $cod_docente)
            ->with(['materia', 'horarios'])
            ->where('activo', true)
            ->orderBy('orden_preferencia')
            ->get();

        // Calcular totales
        $totalHoras = $cargas->sum('horas_asignadas');

        return response()->json([
            'docente' => [
                'cod_docente' => $docente->cod_docente,
                'nombre' => $docente->usuario->nombre . ' ' . $docente->usuario->apellido,
                'especialidad' => $docente->especialidad
            ],
            'cargas' => $cargas,
            'total_horas' => $totalHoras,
            'cantidad_materias' => $cargas->count()
        ]);
    }

    /**
     * Crear nueva carga horaria para un docente
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cod_docente' => 'required|exists:Docente,cod_docente',
            'sigla_materia' => 'required|exists:Materia,sigla',
            'horas_asignadas' => 'required|integer|min:1|max:100',
            'orden_preferencia' => 'nullable|integer|min:1',
            'activo' => 'nullable|boolean'
        ]);

        try {
            DB::beginTransaction();

            // Validar que no exista ya esta asignación
            $existe = CargaHorariaDocente::where('cod_docente', $validated['cod_docente'])
                ->where('sigla_materia', $validated['sigla_materia'])
                ->first();

            if ($existe) {
                return response()->json([
                    'message' => 'Esta materia ya está asignada a este docente'
                ], 422);
            }

            // Determinar orden de preferencia si no se proporciona
            if (!isset($validated['orden_preferencia'])) {
                $maxOrden = CargaHorariaDocente::where('cod_docente', $validated['cod_docente'])
                    ->max('orden_preferencia') ?? 0;
                $validated['orden_preferencia'] = $maxOrden + 1;
            }

            $validated['activo'] = $validated['activo'] ?? true;

            $cargaHoraria = CargaHorariaDocente::create($validated);

            DB::commit();

            return response()->json($cargaHoraria->load(['docente.usuario', 'materia']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear carga horaria: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una carga horaria específica
     */
    public function show($id)
    {
        $cargaHoraria = CargaHorariaDocente::with(['docente.usuario', 'materia', 'horarios'])
            ->findOrFail($id);

        return response()->json($cargaHoraria);
    }

    /**
     * Actualizar carga horaria
     */
    public function update(Request $request, $id)
    {
        $cargaHoraria = CargaHorariaDocente::findOrFail($id);

        $validated = $request->validate([
            'horas_asignadas' => 'sometimes|integer|min:1|max:100',
            'orden_preferencia' => 'sometimes|integer|min:1',
            'activo' => 'sometimes|boolean'
        ]);

        try {
            DB::beginTransaction();

            $cargaHoraria->update($validated);

            DB::commit();

            return response()->json($cargaHoraria->load(['docente.usuario', 'materia']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar carga horaria: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar carga horaria
     */
    public function destroy($id)
    {
        $cargaHoraria = CargaHorariaDocente::findOrFail($id);

        try {
            DB::beginTransaction();

            // Eliminar primero los horarios asociados
            HorarioDisponibilidad::where('id_carga', $id)->delete();

            // Luego eliminar la carga horaria
            $cargaHoraria->delete();

            DB::commit();

            return response()->json(['message' => 'Carga horaria eliminada correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar carga horaria: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validar que las horas asignadas no superen un límite
     */
    public function validarHoras(Request $request)
    {
        $validated = $request->validate([
            'cod_docente' => 'required|exists:Docente,cod_docente',
            'horas_limite' => 'required|integer|min:1'
        ]);

        $docente = Docente::findOrFail($validated['cod_docente']);

        $totalHoras = CargaHorariaDocente::where('cod_docente', $validated['cod_docente'])
            ->where('activo', true)
            ->sum('horas_asignadas');

        return response()->json([
            'docente' => $docente->usuario->nombre . ' ' . $docente->usuario->apellido,
            'total_horas_asignadas' => $totalHoras,
            'limite' => $validated['horas_limite'],
            'disponible' => $validated['horas_limite'] - $totalHoras,
            'valido' => $totalHoras <= $validated['horas_limite']
        ]);
    }

    /**
     * Agregar horario disponible a una carga horaria
     */
    public function agregarHorario(Request $request, $id)
    {
        $cargaHoraria = CargaHorariaDocente::findOrFail($id);

        $validated = $request->validate([
            'dia_semana' => 'required|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'aula_id' => 'nullable|exists:Infraestructura,id_infraestructura',
            'activo' => 'nullable|boolean'
        ]);

        try {
            DB::beginTransaction();

            $validated['id_carga'] = $id;
            $validated['activo'] = $validated['activo'] ?? true;

            $horario = HorarioDisponibilidad::create($validated);

            DB::commit();

            return response()->json($horario->load('aula'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al agregar horario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar horario disponible
     */
    public function actualizarHorario(Request $request, $id, $idHorario)
    {
        $horario = HorarioDisponibilidad::findOrFail($idHorario);

        $validated = $request->validate([
            'dia_semana' => 'sometimes|in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo',
            'hora_inicio' => 'sometimes|date_format:H:i',
            'hora_fin' => 'sometimes|date_format:H:i',
            'aula_id' => 'nullable|exists:Infraestructura,id_infraestructura',
            'activo' => 'sometimes|boolean'
        ]);

        try {
            DB::beginTransaction();

            $horario->update($validated);

            DB::commit();

            return response()->json($horario->load('aula'));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar horario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar horario disponible
     */
    public function eliminarHorario($id, $idHorario)
    {
        $horario = HorarioDisponibilidad::findOrFail($idHorario);

        try {
            $horario->delete();
            return response()->json(['message' => 'Horario eliminado correctamente']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar horario: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todos los horarios de un docente
     */
    public function obtenerHorariosDocente($cod_docente)
    {
        $cargas = CargaHorariaDocente::where('cod_docente', $cod_docente)
            ->where('activo', true)
            ->with(['materia', 'horarios.aula'])
            ->get();

        $horarios = [];
        foreach ($cargas as $carga) {
            foreach ($carga->horarios as $horario) {
                $horarios[] = [
                    'id_horario' => $horario->id_horario,
                    'materia' => $carga->materia->nombre,
                    'sigla' => $carga->materia->sigla,
                    'dia_semana' => $horario->dia_semana,
                    'hora_inicio' => $horario->hora_inicio,
                    'hora_fin' => $horario->hora_fin,
                    'aula' => $horario->aula ? $horario->aula->nombre : 'Por definir'
                ];
            }
        }

        return response()->json($horarios);
    }
}
