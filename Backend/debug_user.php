<?php
require 'vendor/autoload.php';
require 'bootstrap/app.php';

$app = require 'bootstrap/app.php';

try {
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    
    $user = \App\Models\Usuario::where('correo', 'admin@ficct.test')->first();
    
    if ($user) {
        echo "✓ Usuario encontrado:\n";
        echo "  - ID: " . $user->id . "\n";
        echo "  - Correo: " . $user->correo . "\n";
        echo "  - Nombre: " . $user->nombre . "\n";
        echo "  - Password hash: " . substr($user->password, 0, 20) . "...\n";
    } else {
        echo "✗ Usuario NO encontrado\n";
        echo "\nUsuarios en la BD:\n";
        $usuarios = \App\Models\Usuario::all();
        foreach ($usuarios as $u) {
            echo "  - " . $u->correo . " (ID: " . $u->id . ")\n";
        }
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
