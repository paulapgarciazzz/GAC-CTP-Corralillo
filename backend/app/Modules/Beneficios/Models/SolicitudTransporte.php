<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudTransporte extends Model
{
    protected $table = 'solicitud_transporte';

    protected $primaryKey = 'id_solicitud_transporte';

    protected $fillable = [
        'matricula',
        'id_ruta',
    ];

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