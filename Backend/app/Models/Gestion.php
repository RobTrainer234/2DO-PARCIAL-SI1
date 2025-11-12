<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gestion extends Model
{
    protected $table = 'Gestion';
    protected $primaryKey = 'id_gestion';
    public $timestamps = false;

    protected $fillable = ['anio','periodo','fecha_inicio','fecha_fin'];
}
