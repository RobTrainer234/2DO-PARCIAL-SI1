<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agregar campos faltantes a Materia
        if (Schema::hasTable('Materia')) {
            Schema::table('Materia', function (Blueprint $table) {
                // Agregar campos solo si no existen
                if (!Schema::hasColumn('Materia', 'codigo')) {
                    $table->string('codigo', 50)->nullable()->after('sigla')->comment('Código único por carrera');
                }
                if (!Schema::hasColumn('Materia', 'nivel')) {
                    $table->integer('nivel')->nullable()->after('nombre')->comment('Nivel/Semestre: 1-10');
                }
                if (!Schema::hasColumn('Materia', 'carga_horaria')) {
                    $table->integer('carga_horaria')->nullable()->after('nivel')->comment('Horas por semana');
                }
            });
        }

        // Agregar campos faltantes a Grupo
        if (Schema::hasTable('Grupo')) {
            Schema::table('Grupo', function (Blueprint $table) {
                if (!Schema::hasColumn('Grupo', 'sigla_materia')) {
                    $table->string('sigla_materia', 20)->nullable()->after('nombre');
                    $table->foreign('sigla_materia')->references('sigla')->on('Materia')->onDelete('cascade');
                }
                if (!Schema::hasColumn('Grupo', 'turno')) {
                    $table->string('turno', 50)->nullable()->after('sigla_materia')->comment('Diurno, Nocturno, Mixto');
                }
                if (!Schema::hasColumn('Grupo', 'paralelo')) {
                    $table->string('paralelo', 10)->nullable()->after('turno')->comment('A, B, C, etc');
                }
                if (!Schema::hasColumn('Grupo', 'cupo_maximo')) {
                    $table->integer('cupo_maximo')->nullable()->after('paralelo');
                }
            });
        }

        // Agregar estado a Infraestructura
        if (Schema::hasTable('Infraestructura')) {
            if (!Schema::hasColumn('Infraestructura', 'activo')) {
                Schema::table('Infraestructura', function (Blueprint $table) {
                    $table->boolean('activo')->default(true)->after('id_tipo')->comment('Activo o en mantenimiento');
                });
            }
        }

        // Agregar soft delete a Horarios
        if (Schema::hasTable('Horarios')) {
            if (!Schema::hasColumn('Horarios', 'deleted_at')) {
                Schema::table('Horarios', function (Blueprint $table) {
                    $table->softDeletes();
                });
            }
        }

        // Agregar campos faltantes a Asistencia
        if (Schema::hasTable('Asistencia')) {
            Schema::table('Asistencia', function (Blueprint $table) {
                if (!Schema::hasColumn('Asistencia', 'evidencia')) {
                    $table->text('evidencia')->nullable()->after('observacion')->comment('URL o path a evidencia');
                }
                if (!Schema::hasColumn('Asistencia', 'fecha_registro')) {
                    $table->timestamp('fecha_registro')->useCurrent()->after('evidencia');
                }
                if (!Schema::hasColumn('Asistencia', 'usuario_id')) {
                    $table->unsignedBigInteger('usuario_id')->nullable()->after('fecha_registro');
                    $table->foreign('usuario_id')->references('id')->on('Usuario')->onDelete('set null');
                }
            });
        }
    }

    public function down(): void
    {
        // Revertir cambios
        if (Schema::hasTable('Materia')) {
            Schema::table('Materia', function (Blueprint $table) {
                if (Schema::hasColumn('Materia', 'carga_horaria')) {
                    $table->dropColumn('carga_horaria');
                }
                if (Schema::hasColumn('Materia', 'nivel')) {
                    $table->dropColumn('nivel');
                }
                if (Schema::hasColumn('Materia', 'codigo')) {
                    $table->dropColumn('codigo');
                }
            });
        }

        if (Schema::hasTable('Grupo')) {
            Schema::table('Grupo', function (Blueprint $table) {
                if (Schema::hasColumn('Grupo', 'cupo_maximo')) {
                    $table->dropColumn('cupo_maximo');
                }
                if (Schema::hasColumn('Grupo', 'paralelo')) {
                    $table->dropColumn('paralelo');
                }
                if (Schema::hasColumn('Grupo', 'turno')) {
                    $table->dropColumn('turno');
                }
                if (Schema::hasColumn('Grupo', 'sigla_materia')) {
                    $table->dropForeign(['sigla_materia']);
                    $table->dropColumn('sigla_materia');
                }
            });
        }

        if (Schema::hasTable('Infraestructura')) {
            if (Schema::hasColumn('Infraestructura', 'activo')) {
                Schema::table('Infraestructura', function (Blueprint $table) {
                    $table->dropColumn('activo');
                });
            }
        }

        if (Schema::hasTable('Horarios')) {
            if (Schema::hasColumn('Horarios', 'deleted_at')) {
                Schema::table('Horarios', function (Blueprint $table) {
                    $table->dropSoftDeletes();
                });
            }
        }

        if (Schema::hasTable('Asistencia')) {
            Schema::table('Asistencia', function (Blueprint $table) {
                if (Schema::hasColumn('Asistencia', 'usuario_id')) {
                    $table->dropForeign(['usuario_id']);
                    $table->dropColumn('usuario_id');
                }
                if (Schema::hasColumn('Asistencia', 'fecha_registro')) {
                    $table->dropColumn('fecha_registro');
                }
                if (Schema::hasColumn('Asistencia', 'evidencia')) {
                    $table->dropColumn('evidencia');
                }
            });
        }
    }
};

