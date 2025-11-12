<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Materia extends Model
{
    protected $table = 'Materia';
    protected $primaryKey = 'sigla';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['sigla', 'nombre', 'semestre', 'horas_teoricas', 'horas_practicas', 'creditos', 'activo'];

    use Auditable;

    protected $casts = [
        'semestre' => 'integer',
        'horas_teoricas' => 'integer',
        'horas_practicas' => 'integer',
        'creditos' => 'integer',
        'activo' => 'boolean'
    ];

    public function carreras()
    {
        return $this->belongsToMany(Carrera::class, 'CarreraMateria', 'sigla_materia', 'id_carrera');
    }

    // Relación: Una materia puede tener muchos grupos
    public function grupos()
    {
        return $this->hasMany(Grupo::class, 'sigla_materia');
    }

    // Relación: Una materia puede tener muchas asignaciones de docentes
    public function asignaciones()
    {
        return $this->hasMany(AsignacionDocente::class, 'sigla_materia');
    }
}