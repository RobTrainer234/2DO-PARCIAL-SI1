<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        $roles = ['Administrador','Coordinador','Docente','Autoridades'];
        foreach ($roles as $r) {
            DB::table('Roles')->insertOrIgnore(['nombre' => $r]);
        }
    }
}
