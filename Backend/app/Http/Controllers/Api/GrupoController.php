<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Grupo;

class GrupoController extends Controller
{
    public function index()
    {
        return Grupo::paginate(20);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string'
        ]);

        $g = Grupo::create($data);
        return response()->json($g, 201);
    }

    public function show($id)
    {
        return Grupo::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $g = Grupo::findOrFail($id);
        $data = $request->validate(['nombre' => 'sometimes|string']);
        $g->update($data);
        return response()->json($g);
    }

    public function destroy($id)
    {
        $g = Grupo::findOrFail($id);
        $g->delete();
        return response()->json(['message' => 'Grupo eliminado']);
    }
}
