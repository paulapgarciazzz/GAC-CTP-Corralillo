<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudAlimentacion extends Model
{
    protected $table = 'solicitud_alimentacion';

    protected $primaryKey = 'id_solicitud_alimentacion';

    protected $fillable = [
        'id_alimentacion',
    ];

    public function alimentacion(): BelongsTo
    {
        return $this->belongsTo(
            Alimentacion::class,
            'id_alimentacion',
            'id_alimentacion'
        );
    }
}