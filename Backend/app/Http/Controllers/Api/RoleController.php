<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permiso;

class RoleController extends Controller
{
    public function index()
    {
        return Role::with('permisos')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate(['nombre' => 'required|string|unique:Roles,nombre']);
        $r = Role::create($data);
        return response()->json($r, 201);
    }

    public function show($id)
    {
        return Role::with('permisos')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $r = Role::findOrFail($id);
        $data = $request->validate(['nombre' => 'required|string']);
        $r->update($data);
        
        // Si se envían permisos, actualizarlos
        if ($request->has('permisos')) {
            $r->permisos()->sync($request->input('permisos', []));
        }
        
        return response()->json($r->load('permisos'));
    }

    public function destroy($id)
    {
        $r = Role::findOrFail($id);
        // Eliminar relaciones primero
        $r->permisos()->detach();
        $r->usuarios()->detach();
        $r->delete();
        return response()->json(['message' => 'Rol eliminado']);
    }

    // Asignar permisos a un rol
    public function asignarPermisos(Request $request, $id)
    {
        $r = Role::findOrFail($id);
        $validated = $request->validate([
            'permisos' => 'required|array',
            'permisos.*' => 'integer|exists:Permisos,id_permiso'
        ]);
        
        $r->permisos()->sync($validated['permisos']);
        return response()->json($r->load('permisos'));
    }
}
