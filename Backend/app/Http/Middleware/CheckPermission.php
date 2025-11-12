<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckPermission
{
    /**
     * Middleware para verificar permisos del usuario

    * Uso en rutas:
     * Route::post('/usuarios', [UsuarioController::class, 'store'])
     *     ->middleware(['auth:sanctum', 'permission:crear_usuarios']);
     * 
     * O múltiples permisos (requiere al menos uno):
     * ->middleware(['auth:sanctum', 'permission:crear_usuarios,editar_usuarios'])
     */
    public function handle(Request $request, Closure $next, $permission = null)
    {
        // Si no se especifica permiso, permitir
        if (!$permission) {
            return $next($request);
        }

        $user = $request->user();

        // Si el usuario no está autenticado
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No autenticado'
            ], 401);
        }

        // Recargar las relaciones para asegurar que están actualizadas
        $user->load('roles.permisos');

        // Obtener los permisos del usuario (a través de sus roles)
        $userPermissions = [];
        foreach ($user->roles as $role) {
            foreach ($role->permisos as $permiso) {
                $userPermissions[] = $permiso->nombre;
            }
        }

        // Log para debugging
        Log::info('CheckPermission - Usuario: ' . $user->correo);
        Log::info('CheckPermission - Roles: ' . json_encode($user->roles->pluck('nombre')->toArray()));
        Log::info('CheckPermission - Permisos del usuario: ' . json_encode($userPermissions));
        Log::info('CheckPermission - Permisos requeridos: ' . $permission);

        // Soportar múltiples permisos separados por comas (OR logic)
        $requiredPermissions = array_map('trim', explode(',', $permission));
        $hasPermission = false;

        foreach ($requiredPermissions as $requiredPermission) {
            if (in_array($requiredPermission, $userPermissions)) {
                $hasPermission = true;
                break;
            }
        }

        // Si el usuario no tiene ninguno de los permisos requeridos
        if (!$hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para realizar esta acción',
                'required_permissions' => $requiredPermissions,
                'user_permissions' => $userPermissions
            ], 403);
        }

        return $next($request);
    }
}
