<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gestion;
use Illuminate\Http\Request;

class GestionController extends Controller
{
    public function index()
    {
        return Gestion::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'anio' => 'required|integer|min:2000|max:2100',
            'periodo' => 'required|string|max:20',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_inicio'
        ]);

        $gestion = Gestion::create($validated);
        return response()->json($gestion, 201);
    }

    public function show($id)
    {
        return Gestion::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $gestion = Gestion::findOrFail($id);

        $validated = $request->validate([
            'anio' => 'sometimes|integer|min:2000|max:2100',
            'periodo' => 'sometimes|string|max:20',
            'fecha_inicio' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date'
        ]);

        $gestion->update($validated);
        return response()->json($gestion);
    }

    public function destroy($id)
    {
        $gestion = Gestion::findOrFail($id);
        $gestion->delete();
        return response()->json(['message' => 'Gestión eliminada']);
    }
}
