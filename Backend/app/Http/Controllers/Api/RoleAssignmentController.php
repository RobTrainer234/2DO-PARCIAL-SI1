<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Role;

class RoleAssignmentController extends Controller
{
    // Assign a role to a user
    public function assign(Request $request, $userId)
    {
        $this->authorizeAction($request);

        $data = $request->validate(['id_rol' => 'required|integer|exists:Roles,id_rol']);
        $user = Usuario::findOrFail($userId);
        // attach in RolUsuario pivot table
        \Illuminate\Support\Facades\DB::table('RolUsuario')->insertOrIgnore([
            'id_rol' => $data['id_rol'],
            'id_usuario' => $user->id,
        ]);

        return response()->json(['message' => 'Rol asignado']);
    }

    public function revoke(Request $request, $userId)
    {
        $this->authorizeAction($request);

        $data = $request->validate(['id_rol' => 'required|integer|exists:Roles,id_rol']);
        \Illuminate\Support\Facades\DB::table('RolUsuario')->where('id_rol', $data['id_rol'])->where('id_usuario', $userId)->delete();
        return response()->json(['message' => 'Rol revocado']);
    }

    protected function authorizeAction(Request $request)
    {
        // Only admin role allowed to assign/revoke
        $user = $request->user();
        if (!$user) abort(401);
        if (!method_exists($user, 'roles') || !$user->roles()->where('nombre','Administrador')->exists()) {
            abort(403, 'Requiere rol Administrador');
        }
    }
}
