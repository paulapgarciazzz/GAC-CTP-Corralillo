<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Mobiliario extends Model
{
    protected $table = 'mobiliario';

    protected $primaryKey = 'id_mobiliario';

    protected $fillable = [
        'nombre',
    ];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(
            SolicitudMobiliario::class,
            'id_sol_mobiliario',
            'id_mobiliario'
        );
    }
}
