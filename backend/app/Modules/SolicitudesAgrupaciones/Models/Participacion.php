<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Participacion extends Model
{
    protected $table = 'participacion';

    protected $fillable = [
        'id_agrupacion',
        'lugar',
        'fecha',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    public function agrupacion(): BelongsTo
    {
        return $this->belongsTo(
            Agrupacion::class,
            'id_agrupacion',
            'id'
        );
    }
}