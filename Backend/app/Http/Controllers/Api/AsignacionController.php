<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DocenteGrupoMateria;

class AsignacionController extends Controller
{
    public function index()
    {
        return DocenteGrupoMateria::with(['docente.usuario','grupo','materia','gestion'])->paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cod_docente' => 'required|integer|exists:Docente,cod_docente',
            'id_grupo' => 'required|integer|exists:Grupo,id_grupo',
            'sigla_materia' => 'required|string|exists:Materia,sigla',
            'id_gestion' => 'required|integer|exists:Gestion,id_gestion'
        ]);

        // unique constraint exists at DB level; handle gracefully
        $exists = DocenteGrupoMateria::where('cod_docente',$data['cod_docente'])
            ->where('id_grupo',$data['id_grupo'])
            ->where('sigla_materia',$data['sigla_materia'])
            ->where('id_gestion',$data['id_gestion'])->exists();
        if ($exists) {
            return response()->json(['message' => 'Asignación ya existe'], 422);
        }

        $asig = DocenteGrupoMateria::create($data);
        return response()->json($asig, 201);
    }

    public function show($id)
    {
        return DocenteGrupoMateria::with(['docente.usuario','grupo','materia','gestion'])->findOrFail($id);
    }

    public function destroy($id)
    {
        $a = DocenteGrupoMateria::findOrFail($id);
        $a->delete();
        return response()->json(['message' => 'Asignación eliminada']);
    }
}
