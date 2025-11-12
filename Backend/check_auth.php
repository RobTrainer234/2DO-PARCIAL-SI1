<?php

/**
 * Verificar credenciales de login directamente
 */

// Cargar configuración
require 'vendor/autoload.php';
require 'bootstrap/app.php';

// Obtener aplicación
$app = require 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Imports necesarios
use Illuminate\Support\Facades\Hash;
use App\Models\Usuario;

// Probar
try {
    echo "=== VERIFICACIÓN DE CREDENCIALES ===\n\n";
    
    // 1. Buscar usuario
    echo "1. Buscando usuario 'admin@ficct.test'...\n";
    $user = Usuario::where('correo', 'admin@ficct.test')->first();
    
    if (!$user) {
        echo "   ✗ Usuario NO encontrado\n\n";
        echo "   Usuarios en BD:\n";
        $all = Usuario::all();
        if (count($all) == 0) {
            echo "   - No hay usuarios\n";
        } else {
            foreach ($all as $u) {
                echo "   - {$u->correo} (ID: {$u->id})\n";
            }
        }
    } else {
        echo "   ✓ Usuario encontrado (ID: {$user->id})\n\n";
        
        // 2. Verificar contraseña
        echo "2. Verificando contraseña 'Secret123!'...\n";
        $password_plain = 'Secret123!';
        $password_hash = $user->password;
        
        echo "   Hash en BD: " . substr($password_hash, 0, 30) . "...\n";
        
        $is_valid = Hash::check($password_plain, $password_hash);
        
        if ($is_valid) {
            echo "   ✓ Contraseña VÁLIDA\n\n";
        } else {
            echo "   ✗ Contraseña INVÁLIDA\n\n";
            echo "   Intentando rehashear...\n";
            
            // Rehashear y guardar
            $user->password = Hash::make($password_plain);
            $user->save();
            
            echo "   ✓ Contraseña actualizada\n\n";
            
            // Verificar de nuevo
            $is_valid = Hash::check($password_plain, $user->password);
            echo "   Verificación final: " . ($is_valid ? "✓ OK" : "✗ FALLO") . "\n";
        }
        
        // 3. Crear token de prueba
        echo "\n3. Generando token de prueba...\n";
        $token = $user->createToken('prueba')->plainTextToken;
        echo "   Token generado: " . substr($token, 0, 20) . "...\n";
    }
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
