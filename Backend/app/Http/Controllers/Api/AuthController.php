<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            \Log::info('Login attempt', ['correo' => $request->input('correo')]);
            
            $correo = $request->input('correo');
            $password = $request->input('password');

            if (!$correo || !$password) {
                return response()->json(['message' => 'Correo y contraseña requeridos'], 400);
            }

            \Log::info('Buscando usuario', ['correo' => $correo]);
            $user = Usuario::where('correo', $correo)->first();
            
            if (!$user) {
                \Log::warning('Usuario no encontrado', ['correo' => $correo]);
                return response()->json(['message' => 'Usuario no encontrado'], 401);
            }

            \Log::info('Usuario encontrado', ['id' => $user->id]);

            if (!Hash::check($password, $user->password)) {
                \Log::warning('Contraseña inválida', ['id' => $user->id]);
                return response()->json(['message' => 'Contraseña inválida'], 401);
            }

            \Log::info('Creando token');
            $token = $user->createToken('api-token')->plainTextToken;
            
            // ✅ NUEVO: Registrar en bitácora el inicio de sesión
            $this->registrarAuditoria(
                $user->id,
                'LOGIN',
                'Usuario',
                $user->id,
                null,
                ['usuario_id' => $user->id, 'correo' => $user->correo]
            );
            
            return response()->json(['token' => $token, 'user' => $user], 200);
        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Error: ' . $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
        }
    }

    public function logout(Request $request)
    {
        // ✅ NUEVO: Registrar en bitácora el cierre de sesión
        $user = $request->user();
        $this->registrarAuditoria(
            $user->id,
            'LOGOUT',
            'Usuario',
            $user->id,
            ['usuario_id' => $user->id, 'correo' => $user->correo],
            null
        );
        
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Registrar una acción en la auditoría
     */
    private function registrarAuditoria(
        $usuarioId,
        $accion,
        $entidad,
        $entidadId,
        $antes,
        $despues
    ) {
        try {
            AuditLog::create([
                'usuario_id' => $usuarioId,
                'accion' => $accion,
                'entidad' => $entidad,
                'entidad_id' => $entidadId,
                'antes' => $antes ? json_encode($antes) : null,
                'despues' => $despues ? json_encode($despues) : null,
                'ip' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'creado_en' => now()
            ]);
        } catch (\Exception $e) {
            \Log::warning('Error registrando auditoría: ' . $e->getMessage());
        }
    }
}
