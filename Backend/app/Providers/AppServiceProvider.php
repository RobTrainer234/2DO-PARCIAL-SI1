<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\AuditObserver;
use App\Models\Usuario;
use App\Models\Docente;
use App\Models\Materia;
use App\Models\Grupo;
use App\Models\Infraestructura;
use App\Models\Horarios;
use App\Models\Asistencia;
use App\Models\DocenteGrupoMateria;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // TEMPORARILY disabled observers to debug 500 error
        // Register audit observer for key models
        // Usuario::observe(AuditObserver::class);
        // Docente::observe(AuditObserver::class);
        // Materia::observe(AuditObserver::class);
        // Grupo::observe(AuditObserver::class);
        // Infraestructura::observe(AuditObserver::class);
        // Horarios::observe(AuditObserver::class);
        // Asistencia::observe(AuditObserver::class);
        // DocenteGrupoMateria::observe(AuditObserver::class);
    }
}
