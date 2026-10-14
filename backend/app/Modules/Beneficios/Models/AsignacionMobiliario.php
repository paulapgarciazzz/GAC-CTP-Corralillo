<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionMobiliario extends Model
{
    protected $table = 'asignacion_mobiliario';

    protected $fillable = [
        'id_asignacion_beneficios',
        'id_mobiliario',
        'cantidad',
    ];

    public function asignacionBeneficios(): BelongsTo
    {
        return $this->belongsTo(
            AsignacionBeneficios::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function mobiliario(): BelongsTo
    {
        return $this->belongsTo(
            Mobiliario::class,
            'id_mobiliario',
            'id_mobiliario'
        );
    }
}
