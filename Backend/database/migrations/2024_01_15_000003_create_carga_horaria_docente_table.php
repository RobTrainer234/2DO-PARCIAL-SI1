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
        Schema::create('CargaHorariaDocente', function (Blueprint $table) {
            $table->id('id_carga');
            $table->unsignedBigInteger('cod_docente');
            $table->string('sigla_materia', 20);
            $table->unsignedInteger('horas_asignadas');
            $table->unsignedInteger('orden_preferencia')->nullable()->default(null);
            $table->boolean('activo')->default(true);
            $table->timestamps();

            // Relaciones
            $table->foreign('cod_docente')
                ->references('cod_docente')
                ->on('Docente')
                ->onDelete('cascade');

            $table->foreign('sigla_materia')
                ->references('sigla')
                ->on('Materia')
                ->onDelete('cascade');

            // Índices
            $table->index('cod_docente');
            $table->index('sigla_materia');
            $table->unique(['cod_docente', 'sigla_materia']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('CargaHorariaDocente');
    }
};
