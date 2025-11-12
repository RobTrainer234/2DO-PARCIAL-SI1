<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ValidacionAsistencia extends Model
{
    protected $table = 'validacion_asistencias';

    protected $fillable = [
        'asistencia_id',
        'coordinador_id',
        'estado_validacion',
        'observaciones_validacion',
        'falta_justificada',
        'fecha_validacion'
    ];

    protected $casts = [
        'falta_justificada' => 'boolean',
        'fecha_validacion' => 'datetime'
    ];

    public function asistencia(): BelongsTo
    {
        return $this->belongsTo(AsistenciaDocente::class);
    }

    public function coordinador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinador_id');
    }
}
