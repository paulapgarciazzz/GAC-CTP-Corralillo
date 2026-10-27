<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSolicitudAgrupacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // El correo y el teléfono son únicos en `encargado`; se ignora al
        // encargado dueño de esta solicitud.
        $cedulaEncargado = SolicitudAgrupacion::with('agrupacion')
            ->find($this->route('id'))
            ?->agrupacion
            ?->ced_encargado;

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
                Rule::unique('encargado', 'email')->ignore($cedulaEncargado, 'cedula'),
            ],
            'encargado.numero_tel' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('encargado', 'numero_tel')->ignore($cedulaEncargado, 'cedula'),
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
            'solicitud.id_evento' => [
                'sometimes',
                'required',
                'integer',
                'exists:evento,id_evento',
            ],
            'solicitud.fecha_solicitada' => [
                'sometimes',
                'required',
                'date',
            ],
            'solicitud.hora_solicitada' => [
                'sometimes',
                'required',
                'date_format:H:i',
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

    public function messages(): array
    {
        return [
            'encargado.email.unique' => 'Este correo electrónico ya está registrado.',
            'encargado.numero_tel.unique' => 'Este número de teléfono ya está registrado.',
            'solicitud.id_evento.required' => 'Debe seleccionar el evento en el que desea participar.',
        ];
    }
}
