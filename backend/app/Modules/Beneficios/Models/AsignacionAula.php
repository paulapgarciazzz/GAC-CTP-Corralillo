<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionAula extends Model
{
    protected $table = 'asignacion_aula';

    protected $fillable = [
        'id_asignacion_beneficios',
        'id_aula',
    ];

    public function asignacionBeneficios(): BelongsTo
    {
        return $this->belongsTo(
            AsignacionBeneficios::class,
            'id_asignacion_beneficios',
            'id'
        );
    }

    public function aula(): BelongsTo
    {
        return $this->belongsTo(
            Aula::class,
            'id_aula',
            'id_aula'
        );
    }
}
