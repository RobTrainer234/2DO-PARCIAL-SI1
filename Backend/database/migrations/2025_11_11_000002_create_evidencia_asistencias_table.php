<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evidencia_asistencias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('asistencia_id');
            $table->enum('tipo_evidencia', ['Foto', 'Archivo', 'Observacion']);
            $table->string('archivo')->nullable();
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evidencia_asistencias');
    }
};
