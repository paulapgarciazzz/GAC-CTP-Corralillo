<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Encargado extends Model
{
    protected $table = 'encargado';

    protected $primaryKey = 'cedula';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'cedula',
        'primer_nombre',
        'apellido',
        'email',
        'numero_tel',
    ];

    public function agrupaciones(): HasMany
    {
        return $this->hasMany(
            Agrupacion::class,
            'ced_encargado',
            'cedula'
        );
    }

    public function solicitudes(): HasManyThrough
    {
        return $this->hasManyThrough(
            SolicitudAgrupacion::class,
            Agrupacion::class,
            'ced_encargado',
            'id_agrupacion',
            'cedula',
            'id'
        );
    }
}