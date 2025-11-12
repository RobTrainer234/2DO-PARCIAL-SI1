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
        // Agregar columnas a la tabla Materia
        if (Schema::hasTable('Materia')) {
            Schema::table('Materia', function (Blueprint $table) {
                if (!Schema::hasColumn('Materia', 'horas_teoricas')) {
                    $table->integer('horas_teoricas')->nullable()->default(3)->after('nombre');
                }
                if (!Schema::hasColumn('Materia', 'horas_practicas')) {
                    $table->integer('horas_practicas')->nullable()->default(2)->after('horas_teoricas');
                }
                if (!Schema::hasColumn('Materia', 'creditos')) {
                    $table->integer('creditos')->nullable()->default(3)->after('horas_practicas');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('Materia')) {
            Schema::table('Materia', function (Blueprint $table) {
                if (Schema::hasColumn('Materia', 'horas_teoricas')) {
                    $table->dropColumn('horas_teoricas');
                }
                if (Schema::hasColumn('Materia', 'horas_practicas')) {
                    $table->dropColumn('horas_practicas');
                }
                if (Schema::hasColumn('Materia', 'creditos')) {
                    $table->dropColumn('creditos');
                }
            });
        }
    }
};
