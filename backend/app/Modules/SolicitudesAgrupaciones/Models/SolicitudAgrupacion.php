<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SolicitudAgrupacion extends Model
{
    protected $table = 'solicitud_agrupacion';

    protected $fillable = [
        'id_agrupacion',
        'fecha_solicitud',
        'fecha_asignada',
        'hora_asignada',
        'id_estado',
        'comentarios',
    ];

    protected $casts = [
        'fecha_solicitud' => 'datetime',
        'fecha_asignada' => 'date',
    ];

    public function agrupacion(): BelongsTo
    {
        return $this->belongsTo(
            Agrupacion::class,
            'id_agrupacion',
            'id'
        );
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(
            Estado::class,
            'id_estado',
            'id'
        );
    }

    public function auditorias(): HasMany
    {
        return $this->hasMany(
            Auditoria::class,
            'id_solicitud',
            'id'
        );
    }
}