<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvidenciaAsistencia extends Model
{
    protected $table = 'evidencia_asistencias';

    protected $fillable = [
        'asistencia_id',
        'tipo_evidencia',
        'archivo',
        'descripcion'
    ];

    public function asistencia(): BelongsTo
    {
        return $this->belongsTo(AsistenciaDocente::class);
    }
}
