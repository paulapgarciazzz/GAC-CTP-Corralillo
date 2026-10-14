<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agrupacion extends Model
{
    protected $table = 'agrupacion';

    protected $fillable = [
        'ced_encargado',
        'nombre',
        'lugar_procedencia',
        'cantidad_integrantes',
        'resena',
        'foto_url',
        'archivo_adjunto',
    ];

    public function encargado(): BelongsTo
    {
        return $this->belongsTo(
            Encargado::class,
            'ced_encargado',
            'cedula'
        );
    }

    public function solicitudes(): HasMany
    {
        return $this->hasMany(
            SolicitudAgrupacion::class,
            'id_agrupacion',
            'id'
        );
    }

    public function participaciones(): HasMany
    {
        return $this->hasMany(
            Participacion::class,
            'id_agrupacion',
            'id'
        );
    }
}