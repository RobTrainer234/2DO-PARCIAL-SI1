<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Usuario;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class CreateAdminUser extends Command
{
    protected $signature = 'create:admin {correo=admin@ficct.test} {password=Secret123!}';
    protected $description = 'Create an admin user for the application';

    public function handle()
    {
        $correo = $this->argument('correo');
        $password = $this->argument('password');

        try {
            // Check if user exists
            $user = Usuario::where('correo', $correo)->first();
            if (!$user) {
                $user = Usuario::create([
                    'nombre' => 'Administrador',
                    'apellido' => 'Sistema',
                    'telefono' => '0000000',
                    'sexo' => 'M',
                    'correo' => $correo,
                    'ci' => '0000000',
                    'direccion' => 'Oficina Central',
                    'password' => Hash::make($password),
                    'activo' => true,
                ]);
                $this->info("Usuario creado: $correo");
            } else {
                $this->info("Usuario ya existe: $correo");
            }

            // Attach role
            $role = Role::where('nombre', 'Administrador')->first();
            if ($role) {
                DB::table('RolUsuario')->updateOrInsert(
                    ['id_usuario' => $user->id, 'id_rol' => $role->id_rol],
                    ['id_usuario' => $user->id, 'id_rol' => $role->id_rol]
                );
                $this->info("Rol asignado: Administrador");
            }

            $this->info("✓ Admin user setup completed successfully");
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
