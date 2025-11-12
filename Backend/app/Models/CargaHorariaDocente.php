<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class CargaHorariaDocente extends Model
{
    protected $table = 'CargaHorariaDocente';
    protected $primaryKey = 'id_carga';
    public $timestamps = false;

    protected $fillable = [
        'cod_docente',
        'sigla_materia',
        'horas_asignadas',
        'orden_preferencia',
        'activo'
    ];

    protected $casts = [
        'horas_asignadas' => 'integer',
        'orden_preferencia' => 'integer',
        'activo' => 'boolean'
    ];

    // Relación: Pertenece a un Docente
    public function docente()
    {
        return $this->belongsTo(Docente::class, 'cod_docente', 'cod_docente');
    }

    // Relación: Pertenece a una Materia
    public function materia()
    {
        return $this->belongsTo(Materia::class, 'sigla_materia', 'sigla');
    }

    // Relación: Tiene muchos horarios disponibles
    public function horarios()
    {
        return $this->hasMany(HorarioDisponibilidad::class, 'id_carga', 'id_carga');
    }

    use Auditable;
}
