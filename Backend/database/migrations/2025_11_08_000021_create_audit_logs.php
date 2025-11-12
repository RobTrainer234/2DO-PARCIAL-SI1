<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id')->nullable()->index();
            $table->string('accion', 100);
            $table->string('entidad')->nullable();
            $table->string('entidad_id')->nullable();
            $table->jsonb('antes')->nullable();
            $table->jsonb('despues')->nullable();
            $table->string('ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('creado_en')->useCurrent();

            $table->foreign('usuario_id')->references('id')->on('Usuario')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
