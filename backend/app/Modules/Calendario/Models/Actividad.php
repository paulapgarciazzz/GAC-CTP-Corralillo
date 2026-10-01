<?php

namespace App\Modules\Calendario\Models;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Actividad extends Model
{
    protected $table = 'actividad';

    protected $primaryKey = 'id_actividad';

    protected $fillable = [
        'titulo',
        'fecha',
        'hora_inicio',
        'hora_finalizacion',
        'id_ubicacion',
        'id_estado_actividad',
        'id_evento',
        'id_agrupacion',
    ];

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(
            Evento::class,
            'id_evento',
            'id_evento'
        );
    }

    public function ubicacion(): BelongsTo
    {
        return $this->belongsTo(
            Ubicacion::class,
            'id_ubicacion',
            'id_ubicacion'
        );
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(
            EstadoActividad::class,
            'id_estado_actividad',
            'id_estado_actividad'
        );
    }

    public function agrupacion(): BelongsTo
    {
        return $this->belongsTo(
            Agrupacion::class,
            'id_agrupacion',
            'id'
        );
    }
}
