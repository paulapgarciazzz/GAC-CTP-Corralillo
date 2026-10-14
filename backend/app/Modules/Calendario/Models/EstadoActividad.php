<?php

namespace App\Modules\Calendario\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoActividad extends Model
{
    public const PROXIMAMENTE = 'proximamente';

    public const EN_PROGRESO = 'en progreso';

    public const FINALIZADA = 'finalizada';

    protected $table = 'estado_actividad';

    protected $primaryKey = 'id_estado_actividad';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];
}
