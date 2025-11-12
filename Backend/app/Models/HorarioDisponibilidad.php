<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class HorarioDisponibilidad extends Model
{
    protected $table = 'HorarioDisponibilidad';
    protected $primaryKey = 'id_horario';
    public $timestamps = false;

    protected $fillable = [
        'id_carga',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'aula_id',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    // Relación: Pertenece a una Carga Horaria
    public function cargaHoraria()
    {
        return $this->belongsTo(CargaHorariaDocente::class, 'id_carga', 'id_carga');
    }

    // Relación: Pertenece a un Aula (opcional)
    public function aula()
    {
        return $this->belongsTo(Infraestructura::class, 'aula_id', 'id_infraestructura');
    }

    use Auditable;
}
