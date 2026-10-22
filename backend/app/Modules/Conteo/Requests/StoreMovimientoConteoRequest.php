<?php

namespace App\Modules\Conteo\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Movimiento enviado por un dispositivo ya autenticado (AutenticarSensor).
 * El sensor, y por tanto el tipo, salen de las credenciales, no del cuerpo.
 */
class StoreMovimientoConteoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Lo genera el dispositivo una vez por detección y lo repite en
            // cada reintento. Sin "unique": un repetido no es un error, es un
            // reintento (ver MovimientoConteoService::registrar).
            'identificador_evento' => [
                'required',
                'string',
                'max:64',
                'regex:/^[A-Za-z0-9._:-]+$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'identificador_evento.regex' => 'El identificador del evento solo admite letras, números y los caracteres . _ : -',
        ];
    }
}
