<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Aula extends Model
{
    protected $table = 'aula';

    protected $primaryKey = 'id_aula';

    protected $fillable = [
        'nombre',
        'capacidad',
    ];

    public function asignacionesBeneficios(): HasMany
    {
        return $this->hasMany(
            AsignacionBeneficios::class,
            'id_aula',
            'id_aula'
        );
    }
}