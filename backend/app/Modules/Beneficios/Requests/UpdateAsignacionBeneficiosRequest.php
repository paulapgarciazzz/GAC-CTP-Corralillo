<?php

namespace App\Modules\Beneficios\Requests;

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
            'id_agrupacion' => [
                'sometimes',
                'required',
                'integer',
                'exists:agrupacion,id',
            ],

            'fecha_solicitud' => [
                'sometimes',
                'required',
                'date',
            ],

            'mobiliario' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'mobiliario.id_mobiliario' => [
                'required_with:mobiliario',
                'integer',
                'exists:mobiliario,id_mobiliario',
            ],

            'mobiliario.cantidad' => [
                'required_with:mobiliario',
                'integer',
                'min:1',
            ],

            'id_alimentacion' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:alimentacion,id_alimentacion',
            ],

            'id_tarima' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:tarima,id_tarima',
            ],

            'id_aula' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:aula,id_aula',
            ],

            'transporte' => [
                'sometimes',
                'nullable',
                'array',
            ],

            'transporte.matricula' => [
                'required_with:transporte',
                'string',
                'max:6',
                'exists:transporte,matricula',
            ],

            'transporte.id_ruta' => [
                'required_with:transporte',
                'integer',
                'exists:ruta,id_ruta',
            ],

            'id_solicitud_mobiliario' => ['prohibited'],
            'id_solicitud_alimentacion' => ['prohibited'],
            'id_solicitud_transporte' => ['prohibited'],
        ];
    }
}