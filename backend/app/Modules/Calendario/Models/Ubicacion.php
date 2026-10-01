<?php

namespace App\Modules\Calendario\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ubicacion extends Model
{
    protected $table = 'ubicacion';

    protected $primaryKey = 'id_ubicacion';

    protected $fillable = [
        'nombre',
        'descripcion',
        'capacidad',
        'imagen',
    ];

    protected $casts = [
        'capacidad' => 'integer',
    ];

    public function actividades(): HasMany
    {
        return $this->hasMany(
            Actividad::class,
            'id_ubicacion',
            'id_ubicacion'
        );
    }
}
