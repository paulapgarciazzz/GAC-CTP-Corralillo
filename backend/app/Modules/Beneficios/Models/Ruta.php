<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ruta extends Model
{
    protected $table = 'ruta';

    protected $primaryKey = 'id_ruta';

    protected $fillable = [
        'nombre_ruta',
    ];

    public function solicitudesTransporte(): HasMany
    {
        return $this->hasMany(
            SolicitudTransporte::class,
            'id_ruta',
            'id_ruta'
        );
    }
}