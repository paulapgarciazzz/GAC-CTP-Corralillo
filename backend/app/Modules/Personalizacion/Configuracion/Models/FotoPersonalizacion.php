<?php

namespace App\Modules\Personalizacion\Configuracion\Models;

use Illuminate\Database\Eloquent\Model;

class FotoPersonalizacion extends Model
{
    public const DESTINOS = ['hero', 'galeria'];

    protected $table = 'foto_personalizacion';

    protected $primaryKey = 'id_foto';

    protected $fillable = [
        'destino',
        'archivo',
        'titulo',
        'orden',
        'activo',
    ];

    protected $casts = [
        'orden' => 'integer',
        'activo' => 'boolean',
    ];
}
