<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alimentacion extends Model
{
    protected $table = 'alimentacion';

    protected $primaryKey = 'id_alimentacion';

    protected $fillable = [
        'tiempo_comida',
    ];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(
            SolicitudAlimentacion::class,
            'id_alimentacion',
            'id_alimentacion'
        );
    }
}