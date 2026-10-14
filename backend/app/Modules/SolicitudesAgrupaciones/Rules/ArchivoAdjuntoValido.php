<?php

namespace App\Modules\SolicitudesAgrupaciones\Rules;

use App\Modules\SolicitudesAgrupaciones\Support\DataUri;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ArchivoAdjuntoValido implements ValidationRule
{
    private const MIMES_PERMITIDOS = ['image/png', 'image/jpeg', 'application/pdf'];

    private const TAMANO_MAXIMO_BYTES = 4 * 1024 * 1024; // 4MB decodificados

    private const FIRMAS = [
        'image/png' => "\x89PNG\r\n\x1a\n",
        'image/jpeg' => "\xFF\xD8\xFF",
        'application/pdf' => '%PDF-',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('El archivo adjunto no tiene un formato válido.');

            return;
        }

        $datos = DataUri::parse($value);

        if ($datos === null) {
            $fail('El archivo adjunto debe ser un archivo válido codificado correctamente.');

            return;
        }

        if (!in_array($datos['mime'], self::MIMES_PERMITIDOS, true)) {
            $fail('El archivo adjunto debe ser una imagen PNG, JPG o un PDF.');

            return;
        }

        if (strlen($datos['binario']) > self::TAMANO_MAXIMO_BYTES) {
            $fail('El archivo adjunto no debe superar los 4MB.');

            return;
        }

        $firma = self::FIRMAS[$datos['mime']];

        if (!str_starts_with($datos['binario'], $firma)) {
            $fail('El contenido del archivo no coincide con el tipo declarado.');
        }
    }
}
