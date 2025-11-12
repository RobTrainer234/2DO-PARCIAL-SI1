<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('HorarioDisponibilidad', function (Blueprint $table) {
            $table->id('id_horario');
            $table->unsignedBigInteger('id_carga');
            $table->string('dia_semana', 20);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedBigInteger('aula_id')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Relaciones
            $table->foreign('id_carga')
                ->references('id_carga')
                ->on('CargaHorariaDocente')
                ->onDelete('cascade');

            $table->foreign('aula_id')
                ->references('id_infraestructura')
                ->on('Infraestructura')
                ->onDelete('set null');

            // Índices
            $table->index('id_carga');
            $table->index('aula_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('HorarioDisponibilidad');
    }
};
