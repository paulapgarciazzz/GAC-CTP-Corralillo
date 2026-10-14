<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionAlimentacion extends Model
{
    protected $table = 'asignacion_alimentacion';

    protected $fillable = [
        'id_asignacion_beneficios',
        'id_alimentacion',
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

    public function alimentacion(): BelongsTo
    {
        return $this->belongsTo(
            Alimentacion::class,
            'id_alimentacion',
            'id_alimentacion'
        );
    }
}
