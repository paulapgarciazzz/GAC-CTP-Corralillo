<?php

namespace App\Modules\Conteo\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConteoReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha' => ['required', 'date'],
        ];
    }
}
