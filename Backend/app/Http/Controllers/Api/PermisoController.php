<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Permiso;

class PermisoController extends Controller
{
    public function index()
    {
        return Permiso::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate(['nombre' => 'required|string|unique:Permisos,nombre']);
        $p = Permiso::create($data);
        return response()->json($p, 201);
    }

    public function show($id)
    {
        return Permiso::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $p = Permiso::findOrFail($id);
        $data = $request->validate(['nombre' => 'required|string']);
        $p->update($data);
        return response()->json($p);
    }

    public function destroy($id)
    {
        $p = Permiso::findOrFail($id);
        $p->delete();
        return response()->json(['message' => 'Permiso eliminado']);
    }
}
