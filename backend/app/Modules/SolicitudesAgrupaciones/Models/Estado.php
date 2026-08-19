<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estado extends Model
{
    protected $table = 'estado';

    protected $fillable = [
        'nom_estado',
    ];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(
            SolicitudAgrupacion::class,
            'id_estado',
            'id'
        );
    }
}