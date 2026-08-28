<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSolicitudAgrupacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'encargado' => [
                'sometimes',
                'array',
            ],
            'encargado.primer_nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'encargado.apellido' => [
                'sometimes',
                'required',
                'string',
                'max:100',
            ],
            'encargado.email' => [
                'sometimes',
                'required',
                'email',
                'max:150',
            ],
            'encargado.numero_tel' => [
                'sometimes',
                'required',
                'string',
                'max:20',
            ],

            'agrupacion' => [
                'sometimes',
                'array',
            ],
            'agrupacion.nombre' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],
            'agrupacion.lugar_procedencia' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],
            'agrupacion.cantidad_integrantes' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],
            'agrupacion.resena' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],

            'solicitud' => [
                'sometimes',
                'array',
            ],
            'solicitud.fecha_asignada' => [
                'sometimes',
                'nullable',
                'date',
            ],
            'solicitud.hora_asignada' => [
                'sometimes',
                'nullable',
                'date_format:H:i',
            ],
            'solicitud.comentarios' => [
                'sometimes',
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }
}
