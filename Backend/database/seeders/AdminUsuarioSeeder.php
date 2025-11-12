<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Usuario;
use App\Models\Role;

class AdminUsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure roles exist
        $this->call(RolesSeeder::class);

        $email = 'admin@ficct.test';

        $user = Usuario::where('correo', $email)->first();
        if (!$user) {
            $user = Usuario::create([
                'nombre' => 'Administrador',
                'apellido' => 'Sistema',
                'telefono' => null,
                'sexo' => 'M',
                'correo' => $email,
                'ci' => '0000000',
                'direccion' => 'Oficina',
                'password' => Hash::make('Secret123!'),
                'activo' => true,
            ]);
        }

        // Attach Administrador role if exists
        $role = Role::where('nombre', 'Administrador')->first();
        if ($role) {
            // insert into pivot table if not exists
            DB::table('RolUsuario')->insertOrIgnore([
                'id_rol' => $role->id_rol,
                'id_usuario' => $user->id
            ]);
        }
    }
}
