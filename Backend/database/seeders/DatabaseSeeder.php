<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles, admin user, and materias
        $this->call([
            \Database\Seeders\RolesSeeder::class,
            \Database\Seeders\AdminUsuarioSeeder::class,
            \Database\Seeders\MateriaSeeder::class,
        ]);
    }
}
