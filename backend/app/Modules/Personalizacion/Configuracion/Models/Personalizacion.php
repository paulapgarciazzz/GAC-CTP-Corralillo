<?php

namespace App\Modules\Personalizacion\Configuracion\Models;

use Illuminate\Database\Eloquent\Model;

class Personalizacion extends Model
{
    protected $table = 'personalizacion';

    protected $fillable = [
        'seccion',
        'valores',
    ];

    protected $casts = [
        'valores' => 'array',
    ];
}
