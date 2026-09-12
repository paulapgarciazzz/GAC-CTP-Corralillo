<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudMobiliario extends Model
{
    protected $table = 'solicitud_mobiliario';

    protected $primaryKey = 'id_solicitud_mobiliario';

    protected $fillable = [
        'cantidad',
        'id_sol_mobiliario',
    ];

    public function mobiliario(): BelongsTo
    {
        return $this->belongsTo(
            Mobiliario::class,
            'id_sol_mobiliario',
            'id_mobiliario'
        );
    }
}