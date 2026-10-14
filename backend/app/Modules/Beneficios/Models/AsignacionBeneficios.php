<?php

namespace App\Modules\Beneficios\Models;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AsignacionBeneficios extends Model
{
    protected $table = 'asignacion_beneficios';

    protected $primaryKey = 'id';

    protected $fillable = [
        'id_solicitud_agrupacion',
        'observaciones',
    ];

    public function solicitudAgrupacion(): BelongsTo
    {
        return $this->belongsTo(
            SolicitudAgrupacion::class,
            'id_solicitud_agrupacion',
            'id'
        );
    }

    public function mobiliarios(): HasMany
    {
        return $this->hasMany(
            AsignacionMobiliario::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function alimentaciones(): HasMany
    {
        return $this->hasMany(
            AsignacionAlimentacion::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function aulas(): HasMany
    {
        return $this->hasMany(
            AsignacionAula::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function transportes(): HasMany
    {
        return $this->hasMany(
            AsignacionTransporte::class,
            'id_asignacion_beneficios',
            'id'
        );
    }
}