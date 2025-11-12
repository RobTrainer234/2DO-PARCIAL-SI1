<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class Infraestructura extends Model
{
    protected $table = 'Infraestructura';
    protected $primaryKey = 'id_infraestructura';
    public $timestamps = false;

    protected $fillable = ['nro','piso','capacidad','id_tipo'];

    public function tipo()
    {
        return $this->belongsTo(Tipo::class, 'id_tipo');
    }

    public function horarios()
    {
        return $this->hasMany(Horarios::class, 'id_infraestructura', 'id_infraestructura');
    }

    use Auditable;
}
