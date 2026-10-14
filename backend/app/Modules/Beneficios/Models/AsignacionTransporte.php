<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionTransporte extends Model
{
    protected $table = 'asignacion_transporte';

    protected $fillable = [
        'id_asignacion_beneficios',
        'matricula',
        'id_ruta',
    ];

    public function asignacionBeneficios(): BelongsTo
    {
        return $this->belongsTo(
            AsignacionBeneficios::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function transporte(): BelongsTo
    {
        return $this->belongsTo(
            Transporte::class,
            'matricula',
            'matricula'
        );
    }

    public function ruta(): BelongsTo
    {
        return $this->belongsTo(
            Ruta::class,
            'id_ruta',
            'id_ruta'
        );
    }
}
