<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Infraestructura;

class InfraestructuraController extends Controller
{
    public function index()
    {
        return Infraestructura::with('tipo')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nro' => 'required|string',
            'piso' => 'nullable|integer',
            'capacidad' => 'nullable|integer',
            'id_tipo' => 'nullable|integer|exists:Tipo,id_tipo'
        ]);

        $r = Infraestructura::create($data);
        return response()->json($r->load('tipo'), 201);
    }

    public function show($id)
    {
        return Infraestructura::with('tipo')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $r = Infraestructura::findOrFail($id);
        $data = $request->validate([
            'nro' => 'sometimes|string',
            'piso' => 'nullable|integer',
            'capacidad' => 'nullable|integer'
        ]);
        $r->update($data);
        return response()->json($r->load('tipo'));
    }

    public function destroy($id)
    {
        $r = Infraestructura::findOrFail($id);
        $r->delete();
        return response()->json(['message' => 'Aula eliminada']);
    }
}
