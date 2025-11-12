<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Roles
        if (!Schema::hasTable('Roles')) {
            Schema::create('Roles', function (Blueprint $table) {
                $table->id('id_rol');
                $table->string('nombre', 50)->unique();
            });
        }

        // Permisos
        if (!Schema::hasTable('Permisos')) {
            Schema::create('Permisos', function (Blueprint $table) {
                $table->id('id_permiso');
                $table->string('nombre', 50)->unique();
            });
        }

        // RolPermisos
        if (!Schema::hasTable('RolPermisos')) {
            Schema::create('RolPermisos', function (Blueprint $table) {
                $table->unsignedBigInteger('id_rol');
                $table->unsignedBigInteger('id_permiso');
                $table->primary(['id_rol','id_permiso']);
                $table->foreign('id_rol')->references('id_rol')->on('Roles')->onDelete('cascade');
                $table->foreign('id_permiso')->references('id_permiso')->on('Permisos')->onDelete('cascade');
            });
        }

        // RolUsuario
        if (!Schema::hasTable('RolUsuario')) {
            Schema::create('RolUsuario', function (Blueprint $table) {
                $table->unsignedBigInteger('id_rol');
                $table->unsignedBigInteger('id_usuario');
                $table->primary(['id_rol','id_usuario']);
                $table->foreign('id_rol')->references('id_rol')->on('Roles')->onDelete('cascade');
                $table->foreign('id_usuario')->references('id')->on('Usuario')->onDelete('cascade');
            });
        }

        // Administrador
        if (!Schema::hasTable('Administrador')) {
            Schema::create('Administrador', function (Blueprint $table) {
                $table->id('cod_administrador');
                $table->unsignedBigInteger('id_usuario')->unique();
                $table->date('fecha_contrato');
                $table->foreign('id_usuario')->references('id')->on('Usuario')->onDelete('cascade');
            });
        }

        // Docente
        if (!Schema::hasTable('Docente')) {
            Schema::create('Docente', function (Blueprint $table) {
                $table->id('cod_docente');
                $table->unsignedBigInteger('id_usuario')->unique();
                $table->string('especialidad', 100)->nullable();
                $table->date('fecha_contrato')->nullable();
                $table->foreign('id_usuario')->references('id')->on('Usuario')->onDelete('cascade');
            });
        }

        // Gestion
        if (!Schema::hasTable('Gestion')) {
            Schema::create('Gestion', function (Blueprint $table) {
                $table->id('id_gestion');
                $table->integer('anio');
                $table->string('periodo', 20);
                $table->date('fecha_inicio');
                $table->date('fecha_fin');
                $table->unique(['anio','periodo'],'uq_gestion');
            });
        }

        // Carrera
        if (!Schema::hasTable('Carrera')) {
            Schema::create('Carrera', function (Blueprint $table) {
                $table->id('id_carrera');
                $table->string('nombre', 100);
            });
        }

        // Materia
        if (!Schema::hasTable('Materia')) {
            Schema::create('Materia', function (Blueprint $table) {
                $table->string('sigla', 20)->primary();
                $table->string('nombre', 100);
            });
        }

        // CarreraMateria
        if (!Schema::hasTable('CarreraMateria')) {
            Schema::create('CarreraMateria', function (Blueprint $table) {
                $table->unsignedBigInteger('id_carrera');
                $table->string('sigla_materia', 20);
                $table->primary(['id_carrera','sigla_materia']);
                $table->foreign('id_carrera')->references('id_carrera')->on('Carrera')->onDelete('cascade');
                $table->foreign('sigla_materia')->references('sigla')->on('Materia')->onDelete('cascade');
            });
        }

        // Grupo
        if (!Schema::hasTable('Grupo')) {
            Schema::create('Grupo', function (Blueprint $table) {
                $table->id('id_grupo');
                $table->string('nombre', 10);
            });
        }

        // Tipo
        if (!Schema::hasTable('Tipo')) {
            Schema::create('Tipo', function (Blueprint $table) {
                $table->id('id_tipo');
                $table->string('nombre', 50);
            });
        }

        // Infraestructura
        if (!Schema::hasTable('Infraestructura')) {
            Schema::create('Infraestructura', function (Blueprint $table) {
                $table->id('id_infraestructura');
                $table->string('nro', 10);
                $table->integer('piso')->nullable();
                $table->integer('capacidad')->nullable();
                $table->unsignedBigInteger('id_tipo')->nullable();
                $table->foreign('id_tipo')->references('id_tipo')->on('Tipo')->onDelete('set null');
            });
        }

        // DocenteGrupoMateria
        if (!Schema::hasTable('DocenteGrupoMateria')) {
            Schema::create('DocenteGrupoMateria', function (Blueprint $table) {
                $table->id('id_asignacion');
                $table->unsignedBigInteger('cod_docente');
                $table->unsignedBigInteger('id_grupo');
                $table->string('sigla_materia', 20);
                $table->unsignedBigInteger('id_gestion');
                $table->unique(['cod_docente','id_grupo','sigla_materia','id_gestion'],'uq_asignacion');
                $table->foreign('cod_docente')->references('cod_docente')->on('Docente')->onDelete('cascade');
                $table->foreign('id_grupo')->references('id_grupo')->on('Grupo')->onDelete('cascade');
                $table->foreign('sigla_materia')->references('sigla')->on('Materia')->onDelete('cascade');
                $table->foreign('id_gestion')->references('id_gestion')->on('Gestion')->onDelete('cascade');
            });
        }

        // Horarios
        if (!Schema::hasTable('Horarios')) {
            Schema::create('Horarios', function (Blueprint $table) {
                $table->id('id_horario');
                $table->string('dia', 20);
                $table->time('hora_inicio');
                $table->time('hora_final');
                $table->unsignedBigInteger('id_asignacion')->nullable();
                $table->unsignedBigInteger('id_infraestructura')->nullable();
                $table->foreign('id_asignacion')->references('id_asignacion')->on('DocenteGrupoMateria')->onDelete('cascade');
                $table->foreign('id_infraestructura')->references('id_infraestructura')->on('Infraestructura')->onDelete('set null');
                // Some DB drivers don't support check via Blueprint; use raw if needed
                // $table->check('hora_final > hora_inicio');
            });
            // add check constraint with raw SQL for PostgreSQL
            if (Schema::getConnection()->getDriverName() === 'pgsql') {
                Schema::getConnection()->statement("ALTER TABLE \"Horarios\" ADD CONSTRAINT ck_horas_validas CHECK (hora_final > hora_inicio);");
            }
        }

        // Asistencia
        if (!Schema::hasTable('Asistencia')) {
            Schema::create('Asistencia', function (Blueprint $table) {
                $table->id('id_asistencia');
                $table->date('fecha');
                $table->time('hora');
                $table->string('estado', 20)->nullable();
                $table->string('metodo', 50)->nullable();
                $table->text('observacion')->nullable();
                $table->unsignedBigInteger('id_asignacion')->nullable();
                $table->foreign('id_asignacion')->references('id_asignacion')->on('DocenteGrupoMateria')->onDelete('cascade');
            });
        }

        // Reportes
        if (!Schema::hasTable('Reportes')) {
            Schema::create('Reportes', function (Blueprint $table) {
                $table->id('id_reporte');
                $table->string('formato', 20)->nullable();
                $table->timestamp('fecha_generacion')->useCurrent();
                $table->unsignedBigInteger('cod_administrador')->nullable();
                $table->foreign('cod_administrador')->references('cod_administrador')->on('Administrador')->onDelete('set null');
            });
        }

        // Indexes
        if (Schema::hasTable('Usuario') && Schema::hasColumn('Usuario','ci')) {
            Schema::table('Usuario', function (Blueprint $table) {
                $table->index('ci', 'idx_usuario_ci');
            });
        }

        if (Schema::hasTable('Docente') && Schema::hasColumn('Docente','id_usuario')) {
            Schema::table('Docente', function (Blueprint $table) {
                $table->index('id_usuario', 'idx_docente_usuario');
            });
        }

        if (Schema::hasTable('Asistencia') && Schema::hasColumn('Asistencia','id_asignacion')) {
            Schema::table('Asistencia', function (Blueprint $table) {
                $table->index('id_asignacion', 'idx_asistencia_asignacion');
            });
        }

        if (Schema::hasTable('Horarios') && Schema::hasColumn('Horarios','id_asignacion')) {
            Schema::table('Horarios', function (Blueprint $table) {
                $table->index('id_asignacion', 'idx_horarios_asignacion');
            });
        }

        if (Schema::hasTable('DocenteGrupoMateria') && Schema::hasColumn('DocenteGrupoMateria','sigla_materia') && Schema::hasColumn('DocenteGrupoMateria','id_grupo')) {
            Schema::table('DocenteGrupoMateria', function (Blueprint $table) {
                $table->index(['sigla_materia','id_grupo'], 'idx_docente_grupo_materia');
            });
        }
    }

    public function down(): void
    {
    if (Schema::hasTable('Reportes')) Schema::dropIfExists('Reportes');
    if (Schema::hasTable('Asistencia')) Schema::dropIfExists('Asistencia');
    if (Schema::hasTable('Horarios')) Schema::dropIfExists('Horarios');
    if (Schema::hasTable('DocenteGrupoMateria')) Schema::dropIfExists('DocenteGrupoMateria');
    if (Schema::hasTable('Infraestructura')) Schema::dropIfExists('Infraestructura');
    if (Schema::hasTable('Tipo')) Schema::dropIfExists('Tipo');
    if (Schema::hasTable('Grupo')) Schema::dropIfExists('Grupo');
    if (Schema::hasTable('CarreraMateria')) Schema::dropIfExists('CarreraMateria');
    if (Schema::hasTable('Materia')) Schema::dropIfExists('Materia');
    if (Schema::hasTable('Carrera')) Schema::dropIfExists('Carrera');
    if (Schema::hasTable('Gestion')) Schema::dropIfExists('Gestion');
    if (Schema::hasTable('Docente')) Schema::dropIfExists('Docente');
    if (Schema::hasTable('Administrador')) Schema::dropIfExists('Administrador');
    if (Schema::hasTable('RolUsuario')) Schema::dropIfExists('RolUsuario');
    if (Schema::hasTable('RolPermisos')) Schema::dropIfExists('RolPermisos');
    if (Schema::hasTable('Permisos')) Schema::dropIfExists('Permisos');
    if (Schema::hasTable('Roles')) Schema::dropIfExists('Roles');
    }
};
