<?php

namespace App\Modules\Beneficios\Models;

use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AsignacionBeneficios extends Model
{
    /**
     * Tabla asociada al modelo.
     */
    protected $table = 'asignacion_beneficios';

    /**
     * Llave primaria de la tabla.
     *
     * Aunque la tabla fue renombrada a asignacion_beneficios,
     * la llave primaria mantiene su nombre original en la BD.
     */
    protected $primaryKey = 'id_solicitud_beneficios';

    /**
     * Campos permitidos para asignación masiva.
     */
    protected $fillable = [
        'id_agrupacion',
        'id_solicitud_alimentacion',
        'id_solicitud_mobiliario',
        'id_tarima',
        'id_aula',
        'id_solicitud_transporte',
        'fecha_solicitud',
    ];

    /**
     * Conversión automática de tipos.
     */
    protected $casts = [
        'fecha_solicitud' => 'date',
    ];

    /**
     * Agrupación asociada a la asignación de beneficios.
     */
    public function agrupacion(): BelongsTo
    {
        return $this->belongsTo(
            Agrupacion::class,
            'id_agrupacion',
            'id'
        );
    }

    /**
     * Solicitud de alimentación asociada.
     */
    public function solicitudAlimentacion(): BelongsTo
    {
        return $this->belongsTo(
            SolicitudAlimentacion::class,
            'id_solicitud_alimentacion',
            'id_solicitud_alimentacion'
        );
    }

    /**
     * Solicitud de mobiliario asociada.
     */
    public function solicitudMobiliario(): BelongsTo
    {
        return $this->belongsTo(
            SolicitudMobiliario::class,
            'id_solicitud_mobiliario',
            'id_solicitud_mobiliario'
        );
    }

    /**
     * Tarima asociada.
     */
    public function tarima(): BelongsTo
    {
        return $this->belongsTo(
            Tarima::class,
            'id_tarima',
            'id_tarima'
        );
    }

    /**
     * Aula asociada.
     */
    public function aula(): BelongsTo
    {
        return $this->belongsTo(
            Aula::class,
            'id_aula',
            'id_aula'
        );
    }

    /**
     * Solicitud de transporte asociada.
     */
    public function solicitudTransporte(): BelongsTo
    {
        return $this->belongsTo(
            SolicitudTransporte::class,
            'id_solicitud_transporte',
            'id_solicitud_transporte'
        );
    }
}