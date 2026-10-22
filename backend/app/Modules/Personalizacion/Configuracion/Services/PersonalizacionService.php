<?php

namespace App\Modules\Personalizacion\Configuracion\Services;

use App\Modules\Personalizacion\Configuracion\Models\Personalizacion;
use App\Modules\Personalizacion\Configuracion\Support\Predeterminados;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;

class PersonalizacionService
{
    private const DIRECTORIO_IMAGENES = 'personalizacion';

    /**
     * Valores efectivos de una sección: lo guardado sobre los predeterminados.
     * Las imágenes quedan como ruta relativa del disco "public" (o null).
     *
     * @return array<string, mixed>
     */
    public function valores(string $seccion): array
    {
        return array_replace_recursive(
            Predeterminados::de($seccion),
            $this->registro($seccion)->valores ?? []
        );
    }

    /**
     * Guarda los textos validados de una sección sin tocar sus imágenes.
     *
     * @param  array<string, mixed>  $datos
     * @return array<string, mixed>
     */
    public function actualizar(string $seccion, array $datos): array
    {
        $registro = $this->registro($seccion);

        if (array_key_exists('mostrar_galeria', $datos)) {
            $datos['mostrar_galeria'] = (bool) $datos['mostrar_galeria'];
        }

        $registro->valores = array_replace_recursive(
            $registro->valores ?? [],
            Arr::except($datos, Predeterminados::IMAGENES[$seccion] ?? [])
        );
        $registro->save();

        return $this->paraAdministracion($seccion);
    }

    /**
     * Reemplaza una imagen (escudo, logo…) y elimina la anterior del disco.
     *
     * @return array<string, mixed>
     */
    public function guardarImagen(string $seccion, string $campo, UploadedFile $archivo): array
    {
        $registro = $this->registro($seccion);
        $valores = $registro->valores ?? [];
        $anterior = $valores[$campo] ?? null;

        $valores[$campo] = $archivo->store(self::DIRECTORIO_IMAGENES, 'public');
        $registro->valores = $valores;
        $registro->save();

        if ($anterior) {
            Storage::disk('public')->delete($anterior);
        }

        return $this->paraAdministracion($seccion);
    }

    /**
     * Vuelve a la imagen predeterminada y elimina la personalizada del disco.
     *
     * @return array<string, mixed>
     */
    public function restaurarImagen(string $seccion, string $campo): array
    {
        $registro = $this->registro($seccion);
        $valores = $registro->valores ?? [];
        $anterior = $valores[$campo] ?? null;

        if ($registro->exists) {
            $valores[$campo] = null;
            $registro->valores = $valores;
            $registro->save();
        }

        if ($anterior) {
            Storage::disk('public')->delete($anterior);
        }

        return $this->paraAdministracion($seccion);
    }

    /**
     * Datos para el panel: textos actuales, predeterminados (para el botón
     * "Restaurar") e imágenes con su URL.
     *
     * @return array<string, mixed>
     */
    public function paraAdministracion(string $seccion): array
    {
        $camposImagen = Predeterminados::IMAGENES[$seccion] ?? [];
        $valores = $this->valores($seccion);

        $respuesta = [
            'valores' => Arr::except($valores, $camposImagen),
            'predeterminados' => Arr::except(Predeterminados::de($seccion), $camposImagen),
            'imagenes' => collect($camposImagen)->mapWithKeys(fn (string $campo) => [
                $campo => [
                    'url' => $this->urlImagen($valores[$campo] ?? null),
                    'personalizada' => filled($valores[$campo] ?? null),
                ],
            ])->all(),
        ];

        if ($seccion === 'correos') {
            $respuesta['escudo_efectivo'] = $this->escudoCorreo();
            $respuesta['variables'] = Predeterminados::VARIABLES_CORREO;
        }

        return $respuesta;
    }

    /**
     * Lo que necesita la landing pública. Nunca incluye la sección de correos.
     *
     * @return array<string, mixed>
     */
    public function publica(): array
    {
        $apariencia = $this->valores('apariencia');

        return [
            'landing' => $this->valores('landing'),
            'contacto' => $this->valores('contacto'),
            'apariencia' => [
                ...Arr::except($apariencia, Predeterminados::IMAGENES['apariencia']),
                // null = el frontend usa su imagen original empaquetada.
                'escudo_url' => $this->urlImagen($apariencia['escudo'] ?? null),
                'logo_url' => $this->urlImagen($apariencia['logo'] ?? null),
            ],
        ];
    }

    /**
     * Escudo de los correos: el específico de Correos, si no el de Apariencia,
     * si no el original del colegio. Siempre una URL absoluta pública.
     *
     * @return array{url: string, origen: string}
     */
    public function escudoCorreo(): array
    {
        $base = config('personalizacion.url_publica');

        foreach (['correos', 'apariencia'] as $seccion) {
            $ruta = $this->valores($seccion)['escudo'] ?? null;

            if (filled($ruta)) {
                return ['url' => "{$base}/storage/{$ruta}", 'origen' => $seccion];
            }
        }

        return [
            'url' => $base . '/' . Predeterminados::ESCUDO_CORREO_ORIGINAL,
            'origen' => 'predeterminado',
        ];
    }

    private function urlImagen(?string $ruta): ?string
    {
        return filled($ruta) ? Storage::disk('public')->url($ruta) : null;
    }

    /**
     * Si la tabla aún no existe (código desplegado antes de migrar), se
     * trabaja con los predeterminados para que los correos de solicitudes
     * se sigan enviando con sus textos originales. Guardar sí fallará.
     */
    private function registro(string $seccion): Personalizacion
    {
        try {
            return Personalizacion::query()->firstOrNew(['seccion' => $seccion]);
        } catch (QueryException $e) {
            report($e);

            return new Personalizacion(['seccion' => $seccion]);
        }
    }
}
