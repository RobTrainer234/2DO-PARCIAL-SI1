<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tipo;
use Illuminate\Http\Request;

class TipoController extends Controller
{
    public function index()
    {
        return Tipo::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:50|unique:Tipo,nombre'
        ]);

        $tipo = Tipo::create($validated);
        return response()->json($tipo, 201);
    }

    public function show($id)
    {
        return Tipo::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $tipo = Tipo::findOrFail($id);
        
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:50|unique:Tipo,nombre,' . $id . ',id_tipo'
        ]);

        $tipo->update($validated);
        return response()->json($tipo);
    }

    public function destroy($id)
    {
        $tipo = Tipo::findOrFail($id);
        $tipo->delete();
        return response()->json(['message' => 'Tipo eliminado']);
    }
}
