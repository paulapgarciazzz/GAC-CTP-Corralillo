<?php

namespace App\Modules\Calendario\Requests;

use App\Modules\SolicitudesAgrupaciones\Rules\FotoValida;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUbicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $ubicacion = $this->route('ubicacion');

        return [
            'nombre' => [
                'sometimes',
                'required',
                'string',
                'max:100',
                Rule::unique('ubicacion', 'nombre')
                    ->ignore($ubicacion, 'id_ubicacion'),
            ],
            'descripcion' => [
                'sometimes',
                'nullable',
                'string',
                'max:1000',
            ],
            'capacidad' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],
            // Solo se valida una imagen nueva: el formulario reenvía la imagen guardada
            // y las anteriores a esta regla podían ser de otro tipo o tamaño.
            'imagen' => [
                'sometimes',
                'nullable',
                'string',
                Rule::when(
                    $this->input('imagen') !== $ubicacion?->imagen,
                    [new FotoValida()]
                ),
            ],
        ];
    }
}
