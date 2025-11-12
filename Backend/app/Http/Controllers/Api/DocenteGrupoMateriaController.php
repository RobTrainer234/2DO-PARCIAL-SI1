<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocenteGrupoMateria;
use App\Models\Docente;
use App\Models\Grupo;
use App\Models\Materia;
use App\Models\Gestion;
use Illuminate\Http\Request;

class DocenteGrupoMateriaController extends Controller
{
    public function index()
    {
        $asignaciones = DocenteGrupoMateria::with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->orderBy('id_asignacion', 'desc')
            ->get();
        return response()->json($asignaciones);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cod_docente' => 'required|exists:Docente,cod_docente',
            'id_grupo' => 'required|exists:Grupo,id_grupo',
            'sigla_materia' => 'required|exists:Materia,sigla',
            'id_gestion' => 'required|exists:Gestion,id_gestion',
        ]);

        // Check unique constraint manually
        $exists = DocenteGrupoMateria::where('cod_docente', $validated['cod_docente'])
            ->where('id_grupo', $validated['id_grupo'])
            ->where('sigla_materia', $validated['sigla_materia'])
            ->where('id_gestion', $validated['id_gestion'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Esta asignación ya existe'], 422);
        }

        try {
            $asignacion = DocenteGrupoMateria::create($validated);
            return response()->json(
                $asignacion->load(['docente.usuario', 'grupo', 'materia', 'gestion']),
                201
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear asignación: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $asignacion = DocenteGrupoMateria::with(['docente.usuario', 'grupo', 'materia', 'gestion'])
            ->findOrFail($id);
        return response()->json($asignacion);
    }

    public function update(Request $request, $id)
    {
        $asignacion = DocenteGrupoMateria::findOrFail($id);

        $validated = $request->validate([
            'cod_docente' => 'sometimes|required|exists:Docente,cod_docente',
            'id_grupo' => 'sometimes|required|exists:Grupo,id_grupo',
            'sigla_materia' => 'sometimes|required|exists:Materia,sigla',
            'id_gestion' => 'sometimes|required|exists:Gestion,id_gestion',
        ]);

        $asignacion->update($validated);
        return response()->json($asignacion->load(['docente.usuario', 'grupo', 'materia', 'gestion']));
    }

    public function destroy($id)
    {
        $asignacion = DocenteGrupoMateria::findOrFail($id);
        $asignacion->delete();
        return response()->json(['message' => 'Asignación eliminada']);
    }
}
