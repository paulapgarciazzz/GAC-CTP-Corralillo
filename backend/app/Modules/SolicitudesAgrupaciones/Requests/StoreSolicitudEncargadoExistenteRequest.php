<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use App\Modules\SolicitudesAgrupaciones\Rules\ArchivoAdjuntoValido;
use Illuminate\Foundation\Http\FormRequest;

class StoreSolicitudEncargadoExistenteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cedula' => ['required', 'string', 'max:20', 'exists:encargado,cedula'],
            'id_agrupacion' => ['nullable', 'integer', 'exists:agrupacion,id', 'required_without:agrupacion'],
            'agrupacion' => ['nullable', 'array', 'required_without:id_agrupacion'],
            'agrupacion.nombre' => ['required_with:agrupacion', 'string', 'max:150'],
            'agrupacion.lugar_procedencia' => ['required_with:agrupacion', 'string', 'max:150'],
            'agrupacion.cantidad_integrantes' => ['required_with:agrupacion', 'integer', 'min:1'],
            'agrupacion.resena' => ['nullable', 'string', 'max:5000'],
            'agrupacion.archivo_adjunto' => ['required_with:agrupacion', 'string', new ArchivoAdjuntoValido()],

            'solicitud' => ['required', 'array'],
            'solicitud.fecha_solicitada' => ['required', 'date'],
            'solicitud.hora_solicitada' => ['required', 'date_format:H:i'],
            'solicitud.comentarios' => ['nullable', 'string', 'max:5000'],
            'solicitud.fecha_asignada' => ['prohibited'],
            'solicitud.hora_asignada' => ['prohibited'],
        ];
    }
}
