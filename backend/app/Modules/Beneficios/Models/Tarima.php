<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarima extends Model
{
    protected $table = 'tarima';

    protected $primaryKey = 'id_tarima';

    protected $fillable = [
        'nombre',
    ];

    public function asignacionesBeneficios(): HasMany
    {
        return $this->hasMany(
            AsignacionBeneficios::class,
            'id_tarima',
            'id_tarima'
        );
    }
}