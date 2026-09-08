<?php

namespace App\Modules\SolicitudesAgrupaciones\Support;

class DataUri
{
    private const EXTENSIONES = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'application/pdf' => 'pdf',
    ];

    /**
     * @return array{mime: string, binario: string}|null
     */
    public static function parse(?string $valor): ?array
    {
        if (!is_string($valor) || $valor === '') {
            return null;
        }

        if (!preg_match('/^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,(.+)$/', $valor, $coincidencias)) {
            return null;
        }

        $binario = base64_decode($coincidencias[2], true);

        if ($binario === false) {
            return null;
        }

        return [
            'mime' => strtolower($coincidencias[1]),
            'binario' => $binario,
        ];
    }

    public static function extensionParaMime(string $mime): string
    {
        return self::EXTENSIONES[$mime] ?? 'bin';
    }
}
