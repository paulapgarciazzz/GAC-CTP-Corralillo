<?php

namespace App\Modules\Personalizacion\Patrocinadores\Models;

use Illuminate\Database\Eloquent\Model;

class Patrocinador extends Model
{
    protected $table = 'patrocinador';

    protected $primaryKey = 'id_patrocinador';

    protected $fillable = [
        'nombre',
        'logotipo',
        'descripcion',
        'enlace',
        'categoria',
        'orden',
        'activo',
    ];

    protected $casts = [
        'orden' => 'integer',
        'activo' => 'boolean',
    ];
}
