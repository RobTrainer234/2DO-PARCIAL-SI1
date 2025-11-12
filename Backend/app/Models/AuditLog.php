<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_logs';
    protected $fillable = [
        'usuario_id','accion','entidad','entidad_id','antes','despues','ip','user_agent','creado_en'
    ];

    public $timestamps = false;

    protected $casts = [
        'antes' => 'array',
        'despues' => 'array',
        'creado_en' => 'datetime'
    ];
}
