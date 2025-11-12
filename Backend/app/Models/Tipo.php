<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tipo extends Model
{
    protected $table = 'Tipo';
    protected $primaryKey = 'id_tipo';
    public $timestamps = false;

    protected $fillable = [
        'nombre'
    ];

    public function infraestructuras()
    {
        return $this->hasMany(Infraestructura::class, 'id_tipo', 'id_tipo');
    }
}
