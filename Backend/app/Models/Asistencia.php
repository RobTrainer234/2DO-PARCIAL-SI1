<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Asistencia extends Model
{
    protected $table = 'Asistencia';
    protected $primaryKey = 'id_asistencia';
    public $timestamps = false;

    protected $fillable = ['fecha','hora','estado','metodo','observacion','id_asignacion'];

    public function asignacion()
    {
        return $this->belongsTo(DocenteGrupoMateria::class, 'id_asignacion', 'id_asignacion');
    }

    use Auditable;
}
