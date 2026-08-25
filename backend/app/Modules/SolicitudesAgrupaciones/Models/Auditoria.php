<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Auditoria extends Model
{
    protected $table = 'auditoria';

    protected $guarded = ['*'];

    protected $casts = [
        'fecha_accion' => 'datetime',
    ];

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(
            SolicitudAgrupacion::class,
            'id_solicitud',
            'id'
        );
    }
}