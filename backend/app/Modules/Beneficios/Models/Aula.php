<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    protected $table = 'aula';

    protected $primaryKey = 'id_aula';

    protected $fillable = [
        'nombre',
        'capacidad',
        'encargado',
    ];
}