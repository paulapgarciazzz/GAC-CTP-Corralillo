<?php

namespace App\Modules\Calendario\Models;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evento extends Model
{
    protected $table = 'evento';

    protected $primaryKey = 'id_evento';

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'hora_inicio',
        'hora_fin',
        'todo_el_dia',
        'categoria',
        'estado',
    ];

    protected $casts = [
        'fecha_inicio' => 'date:Y-m-d',
        'fecha_fin' => 'date:Y-m-d',
        'todo_el_dia' => 'boolean',
        'estado' => 'boolean',
    ];

    public function solicitudes(): HasMany
    {
        return $this->hasMany(
            SolicitudAgrupacion::class,
            'id_evento',
            'id_evento'
        );
    }
}
