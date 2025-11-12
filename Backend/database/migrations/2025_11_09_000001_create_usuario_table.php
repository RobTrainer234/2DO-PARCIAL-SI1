<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('Usuario')) {
            Schema::create('Usuario', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 100)->nullable();
                $table->string('apellido', 100)->nullable();
                $table->string('telefono', 50)->nullable();
                $table->string('sexo', 10)->nullable();
                $table->string('correo', 150)->unique();
                $table->string('ci', 50)->nullable()->unique();
                $table->string('direccion')->nullable();
                $table->boolean('activo')->default(true);
                $table->string('password')->nullable();
                $table->string('remember_token', 100)->nullable();
                $table->timestamp('email_verified_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('Usuario')) {
            Schema::dropIfExists('Usuario');
        }
    }
};
