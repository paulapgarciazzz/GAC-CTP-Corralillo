<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use App\Modules\SolicitudesAgrupaciones\Rules\ArchivoAdjuntoValido;
use App\Modules\SolicitudesAgrupaciones\Rules\FormatoIdentificacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSolicitudCompletaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'encargado' => ['required', 'array'],
            'encargado.tipo_identificacion' => ['required', 'string', Rule::in(['cedula', 'dimex', 'pasaporte'])],
            'encargado.cedula' => ['required', 'string', 'max:20', 'unique:encargado,cedula', new FormatoIdentificacion()],
            'encargado.primer_nombre' => ['required', 'string', 'max:100'],
            'encargado.apellido' => ['required', 'string', 'max:100'],
            'encargado.email' => ['required', 'email', 'max:150', 'unique:encargado,email'],
            'encargado.numero_tel' => ['required', 'string', 'max:20', 'unique:encargado,numero_tel'],

            'agrupacion' => ['required', 'array'],
            'agrupacion.nombre' => ['required', 'string', 'max:150'],
            'agrupacion.lugar_procedencia' => ['required', 'string', 'max:150'],
            'agrupacion.cantidad_integrantes' => ['required', 'integer', 'min:1'],
            'agrupacion.resena' => ['nullable', 'string', 'max:5000'],
            'agrupacion.archivo_adjunto' => ['required', 'string', new ArchivoAdjuntoValido()],

            'solicitud' => ['required', 'array'],
            'solicitud.fecha_solicitada' => ['required', 'date'],
            'solicitud.hora_solicitada' => ['required', 'date_format:H:i'],
            'solicitud.comentarios' => ['nullable', 'string', 'max:5000'],
            'solicitud.fecha_asignada' => ['prohibited'],
            'solicitud.hora_asignada' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'encargado.cedula.unique' => 'Esta cédula ya está registrada. Si ya ha participado anteriormente, seleccione la opción \'Sí, ya he participado\'.',
            'encargado.email.unique' => 'Este correo electrónico ya está registrado.',
            'encargado.numero_tel.unique' => 'Este número de teléfono ya está registrado.',
        ];
    }
}
