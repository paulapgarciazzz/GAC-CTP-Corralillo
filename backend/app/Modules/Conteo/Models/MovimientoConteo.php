<?php

namespace App\Modules\Conteo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoConteo extends Model
{
    protected $table = 'movimiento_conteo';

    protected $primaryKey = 'id_movimiento';

    protected $fillable = [
        'id_sensor',
        'tipo',
        'identificador_evento',
        'ocurrido_en',
    ];

    protected $casts = [
        'ocurrido_en' => 'datetime',
    ];

    public function sensor(): BelongsTo
    {
        return $this->belongsTo(
            SensorConteo::class,
            'id_sensor',
            'id_sensor'
        );
    }
}
