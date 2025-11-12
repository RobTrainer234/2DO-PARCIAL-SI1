<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AsistenciaDocente extends Model
{
    protected $table = 'asistencia_docentes';

    protected $fillable = [
        'docente_id',
        'grupo_id',
        'fecha',
        'hora_entrada',
        'estado',
        'tipo_registro',
        'codigo_qr',
        'enlace_unico',
        'observaciones',
        'validada',
        'validada_por',
        'fecha_validacion'
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora_entrada' => 'time',
        'validada' => 'boolean',
        'fecha_validacion' => 'datetime'
    ];

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class);
    }

    public function grupo(): BelongsTo
    {
        return $this->belongsTo(Grupo::class);
    }

    public function evidencias(): HasMany
    {
        return $this->hasMany(EvidenciaAsistencia::class);
    }

    public function validaciones(): HasMany
    {
        return $this->hasMany(ValidacionAsistencia::class);
    }
}
