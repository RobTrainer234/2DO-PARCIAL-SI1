<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencia_docentes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('docente_id');
            $table->unsignedBigInteger('grupo_id');
            $table->date('fecha');
            $table->time('hora_entrada');
            $table->enum('estado', ['Presente', 'Atraso', 'Falta', 'Falta justificada'])->default('Falta');
            $table->enum('tipo_registro', ['Manual', 'QR', 'Enlace'])->default('Manual');
            $table->string('codigo_qr')->nullable();
            $table->string('enlace_unico')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('validada')->default(false);
            $table->unsignedBigInteger('validada_por')->nullable();
            $table->timestamp('fecha_validacion')->nullable();
            $table->timestamps();
            
            $table->unique(['docente_id', 'grupo_id', 'fecha']);
            $table->index('fecha');
            $table->index('estado');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencia_docentes');
    }
};
