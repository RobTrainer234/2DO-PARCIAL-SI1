<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'Roles';
    protected $primaryKey = 'id_rol';
    public $timestamps = false;

    protected $fillable = ['nombre'];

    public function permisos()
    {
        return $this->belongsToMany(Permiso::class, 'RolPermisos', 'id_rol', 'id_permiso');
    }

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'RolUsuario', 'id_rol', 'id_usuario');
    }
}
