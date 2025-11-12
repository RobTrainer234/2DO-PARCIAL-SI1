<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Docente extends Model
{
    protected $table = 'Docente';
    protected $primaryKey = 'cod_docente';
    public $timestamps = false;

    protected $fillable = ['id_usuario','especialidad','fecha_contrato'];

    use Auditable;

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function asignaciones()
    {
        return $this->hasMany(DocenteGrupoMateria::class, 'cod_docente', 'cod_docente');
    }
}
