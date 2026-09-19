<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transporte extends Model
{
    protected $table = 'transporte';

    protected $primaryKey = 'matricula';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'matricula',
        'tipo',
        'capacidad',
        'cedula_conductor',
        'nombre_conductor',
        'apellido_conductor',
    ];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(
            SolicitudTransporte::class,
            'matricula',
            'matricula'
        );
    }
}