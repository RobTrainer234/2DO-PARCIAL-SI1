<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\Auditable;

class Horarios extends Model
{
    use SoftDeletes;
    use Auditable;

    protected $table = 'Horarios';
    protected $primaryKey = 'id_horario';
    public $timestamps = false;

    protected $fillable = ['dia','hora_inicio','hora_final','id_asignacion','id_infraestructura'];
    protected $dates = ['deleted_at'];

    public function asignacion()
    {
        return $this->belongsTo(DocenteGrupoMateria::class, 'id_asignacion', 'id_asignacion');
    }

    public function infraestructura()
    {
        return $this->belongsTo(Infraestructura::class, 'id_infraestructura', 'id_infraestructura');
    }
}
