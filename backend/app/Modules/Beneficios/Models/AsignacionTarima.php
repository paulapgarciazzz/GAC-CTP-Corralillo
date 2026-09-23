<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionTarima extends Model
{
    protected $table = 'asignacion_tarima';

    protected $fillable = [
        'id_asignacion_beneficios',
        'id_tarima',
    ];

    public function asignacionBeneficios(): BelongsTo
    {
        return $this->belongsTo(
            AsignacionBeneficios::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function tarima(): BelongsTo
    {
        return $this->belongsTo(
            Tarima::class,
            'id_tarima',
            'id_tarima'
        );
    }
}
