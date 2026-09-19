<?php

namespace App\Modules\Beneficios\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAsignacionBeneficiosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id_agrupacion' => [
                'required',
                'integer',
                'exists:agrupacion,id',
            ],

            'fecha_solicitud' => [
                'required',
                'date',
            ],

            'mobiliario' => [
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
                'nullable',
                'integer',
                'exists:alimentacion,id_alimentacion',
            ],

            'id_tarima' => [
                'nullable',
                'integer',
                'exists:tarima,id_tarima',
            ],

            'id_aula' => [
                'nullable',
                'integer',
                'exists:aula,id_aula',
            ],

            'transporte' => [
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

            // Estos IDs se generan internamente.
            'id_solicitud_mobiliario' => [
                'prohibited',
            ],

            'id_solicitud_alimentacion' => [
                'prohibited',
            ],

            'id_solicitud_transporte' => [
                'prohibited',
            ],
        ];
    }
}