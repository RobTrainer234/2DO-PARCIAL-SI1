<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('validacion_asistencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asistencia_id');
            $table->unsignedBigInteger('coordinador_id');
            $table->enum('estado_validacion', ['Pendiente', 'Aprobada', 'Rechazada', 'En revisión'])->default('Pendiente');
            $table->text('observaciones_validacion')->nullable();
            $table->boolean('falta_justificada')->default(false);
            $table->timestamp('fecha_validacion')->nullable();
            $table->timestamps();
            
            $table->index(['asistencia_id', 'coordinador_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validacion_asistencias');
    }
};
