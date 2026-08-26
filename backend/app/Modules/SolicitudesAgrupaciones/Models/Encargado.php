<?php

namespace App\Modules\SolicitudesAgrupaciones\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Encargado extends Model
{
    protected $table = 'encargado';

    protected $primaryKey = 'cedula';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'cedula',
        'primer_nombre',
        'apellido',
        'email',
        'numero_tel',
    ];

    public function agrupaciones(): HasMany
    {
        return $this->hasMany(
            Agrupacion::class,
            'ced_encargado',
            'cedula'
        );
    }
}