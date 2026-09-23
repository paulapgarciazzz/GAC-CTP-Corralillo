<?php

namespace App\Modules\Beneficios\Models;

use Illuminate\Database\Eloquent\Model;

class Tarima extends Model
{
    protected $table = 'tarima';

    protected $primaryKey = 'id_tarima';

    protected $fillable = [
        'nombre',
    ];
}