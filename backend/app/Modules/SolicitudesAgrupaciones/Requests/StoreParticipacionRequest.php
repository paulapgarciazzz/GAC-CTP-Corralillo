<?php

namespace App\Modules\SolicitudesAgrupaciones\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreParticipacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'lugar' => [
                'required',
                'string',
                'max:150',
            ],

            'fecha' => [
                'required',
                'date',
            ],
        ];
    }
}