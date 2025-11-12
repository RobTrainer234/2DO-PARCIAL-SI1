<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class DocenteGrupoMateria extends Model
{
    protected $table = 'DocenteGrupoMateria';
    protected $primaryKey = 'id_asignacion';
    public $timestamps = false;

    protected $fillable = ['cod_docente','id_grupo','sigla_materia','id_gestion'];

    public function docente()
    {
        return $this->belongsTo(Docente::class, 'cod_docente', 'cod_docente');
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'id_grupo', 'id_grupo');
    }

    public function materia()
    {
        return $this->belongsTo(Materia::class, 'sigla_materia', 'sigla');
    }

    public function gestion()
    {
        return $this->belongsTo(Gestion::class, 'id_gestion', 'id_gestion');
    }

    use Auditable;
}
