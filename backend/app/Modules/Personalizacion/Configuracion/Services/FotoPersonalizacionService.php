<?php

namespace App\Modules\Personalizacion\Configuracion\Services;

use App\Modules\Personalizacion\Configuracion\Models\FotoPersonalizacion;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Fotos del carrusel del Hero y de la galería opcional de la landing.
 */
class FotoPersonalizacionService
{
    private const DIRECTORIO = 'personalizacion/fotos';

    /**
     * Vista administrativa: incluye las inactivas.
     */
    public function listar(string $destino): Collection
    {
        return FotoPersonalizacion::query()
            ->where('destino', $destino)
            ->orderBy('orden')
            ->orderBy('id_foto')
            ->get();
    }

    /**
     * Solo las activas, para la landing pública.
     */
    public function listarActivas(string $destino): Collection
    {
        return FotoPersonalizacion::query()
            ->where('destino', $destino)
            ->where('activo', true)
            ->orderBy('orden')
            ->orderBy('id_foto')
            ->get();
    }

    public function crear(array $datos, UploadedFile $archivo): FotoPersonalizacion
    {
        $datos['archivo'] = $archivo->store(self::DIRECTORIO, 'public');
        $datos['orden'] = $this->siguienteOrden($datos['destino']);

        return FotoPersonalizacion::create($datos)->refresh();
    }

    /**
     * Actualiza título/estado y, si se envía, reemplaza el archivo.
     */
    public function actualizar(FotoPersonalizacion $foto, array $datos, ?UploadedFile $archivo): FotoPersonalizacion
    {
        if ($archivo !== null) {
            $anterior = $foto->archivo;
            $datos['archivo'] = $archivo->store(self::DIRECTORIO, 'public');
            Storage::disk('public')->delete($anterior);
        }

        $foto->update($datos);

        return $foto->refresh();
    }

    public function eliminar(FotoPersonalizacion $foto): void
    {
        $archivo = $foto->archivo;

        $foto->delete();

        Storage::disk('public')->delete($archivo);
    }

    /**
     * @param  array<int, array{id_foto: int, orden: int}>  $items
     */
    public function reordenar(array $items): void
    {
        foreach ($items as $item) {
            FotoPersonalizacion::query()
                ->where('id_foto', $item['id_foto'])
                ->update(['orden' => $item['orden']]);
        }
    }

    private function siguienteOrden(string $destino): int
    {
        return (int) (FotoPersonalizacion::query()->where('destino', $destino)->max('orden') ?? -1) + 1;
    }
}
