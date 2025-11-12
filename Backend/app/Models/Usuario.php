<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\Auditable;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable, Auditable;

    protected $table = 'Usuario';
    protected $primaryKey = 'id';

    protected $fillable = [
        'nombre', 'apellido', 'telefono', 'sexo', 'correo', 'ci', 'direccion', 'password', 'activo'
    ];

    protected $hidden = [
        'password', 'remember_token'
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'activo' => 'boolean'
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'RolUsuario', 'id_usuario', 'id_rol');
    }

    public function docente()
    {
        return $this->hasOne(Docente::class, 'id_usuario', 'id');
    }
}
