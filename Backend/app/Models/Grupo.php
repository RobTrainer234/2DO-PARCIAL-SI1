<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Grupo extends Model
{
    protected $table = 'Grupo';
    protected $primaryKey = 'id_grupo';
    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function asignaciones()
    {
        return $this->hasMany(DocenteGrupoMateria::class, 'id_grupo', 'id_grupo');
    }

    use Auditable;
}
