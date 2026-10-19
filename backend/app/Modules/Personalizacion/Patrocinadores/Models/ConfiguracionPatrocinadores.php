<?php

namespace App\Modules\Personalizacion\Patrocinadores\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionPatrocinadores extends Model
{
    protected $table = 'configuracion_patrocinadores';

    protected $fillable = [
        'titulo',
        'descripcion',
    ];
}
