<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:Administrador')
     */
    public function handle(Request $request, Closure $next, $role)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // roles relation on Usuario should return Role models with 'nombre'
        $has = false;
        if (method_exists($user, 'roles')) {
            $has = $user->roles()->where('nombre', $role)->exists();
        }

        if (!$has) {
            return response()->json(['message' => 'Prohibido: rol requerido ' . $role], 403);
        }

        return $next($request);
    }
}
