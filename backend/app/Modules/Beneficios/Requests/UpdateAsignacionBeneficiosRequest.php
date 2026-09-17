<?php

namespace App\Modules\Beneficios\Requests;

use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAsignacionBeneficiosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_agrupacion' => ['prohibited'],
            'fecha_solicitud' => ['prohibited'],
            'id_solicitud_mobiliario' => ['prohibited'],
            'id_solicitud_alimentacion' => ['prohibited'],
            'id_solicitud_transporte' => ['prohibited'],
            'id_tarima' => ['prohibited'],
            'id_aula' => ['prohibited'],
            'id_alimentacion' => ['prohibited'],
            'id_mobiliario' => ['prohibited'],
            'matricula' => ['prohibited'],

            'id_solicitud_agrupacion' => ['sometimes', 'required', 'integer', 'exists:solicitud_agrupacion,id'],
            'observaciones' => ['sometimes', 'nullable', 'string', 'max:1000'],

            'mobiliarios' => ['sometimes', 'nullable', 'array'],
            'mobiliarios.*.id' => ['nullable', 'integer'],
            'mobiliarios.*.id_mobiliario' => ['required_with:mobiliarios', 'integer', 'exists:mobiliario,id_mobiliario'],
            'mobiliarios.*.cantidad' => ['required_with:mobiliarios', 'integer', 'min:1'],

            'alimentaciones' => ['sometimes', 'nullable', 'array'],
            'alimentaciones.*.id' => ['nullable', 'integer'],
            'alimentaciones.*.id_alimentacion' => ['required_with:alimentaciones', 'integer', 'exists:alimentacion,id_alimentacion'],
            'alimentaciones.*.cantidad' => ['required_with:alimentaciones', 'integer', 'min:1'],

            'aulas' => ['sometimes', 'nullable', 'array'],
            'aulas.*.id' => ['nullable', 'integer'],
            'aulas.*.id_aula' => ['required_with:aulas', 'integer', 'exists:aula,id_aula'],

            'tarimas' => ['sometimes', 'nullable', 'array'],
            'tarimas.*.id' => ['nullable', 'integer'],
            'tarimas.*.id_tarima' => ['required_with:tarimas', 'integer', 'exists:tarima,id_tarima'],

            'transportes' => ['sometimes', 'nullable', 'array'],
            'transportes.*.id' => ['nullable', 'integer'],
            'transportes.*.matricula' => ['required_with:transportes', 'string', 'max:6', 'exists:transporte,matricula'],
            'transportes.*.id_ruta' => ['required_with:transportes', 'integer', 'exists:ruta,id_ruta'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (! $this->has('id_solicitud_agrupacion')) {
                return;
            }

            $idSolicitud = $this->input('id_solicitud_agrupacion');
            $solicitud = SolicitudAgrupacion::with('estado')->find($idSolicitud);

            if (! $solicitud || ! $solicitud->estado || $solicitud->estado->nom_estado !== 'aprobada') {
                $validator->errors()->add(
                    'id_solicitud_agrupacion',
                    'La asignación de beneficios solo puede crearse para solicitudes aprobadas.'
                );
            }
        });
    }
}