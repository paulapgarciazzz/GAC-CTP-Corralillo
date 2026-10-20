<?php

namespace App\Modules\Personalizacion\Patrocinadores\Services;

use App\Modules\Personalizacion\Patrocinadores\Models\Patrocinador;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PatrocinadorService
{
    private const DIRECTORIO_LOGOTIPOS = 'patrocinadores';

    /**
     * Lista todos los patrocinadores (vista administrativa, incluye inactivos).
     */
    public function listar(): Collection
    {
        return Patrocinador::query()
            ->orderBy('orden')
            ->orderBy('id_patrocinador')
            ->get();
    }

    /**
     * Lista únicamente los patrocinadores activos, para la landing pública.
     */
    public function listarActivos(): Collection
    {
        return Patrocinador::query()
            ->where('activo', true)
            ->orderBy('orden')
            ->orderBy('id_patrocinador')
            ->get();
    }

    public function obtenerPorId(int $id): Patrocinador
    {
        return Patrocinador::query()->findOrFail($id);
    }

    /**
     * Crea un nuevo patrocinador, subiendo su logotipo a Storage.
     */
    public function crear(array $datos, UploadedFile $logotipo): Patrocinador
    {
        $datos['logotipo'] = $logotipo->store(self::DIRECTORIO_LOGOTIPOS, 'public');

        if (!array_key_exists('orden', $datos) || $datos['orden'] === null) {
            $datos['orden'] = $this->siguienteOrden();
        }

        return Patrocinador::create($datos)->refresh();
    }

    /**
     * Actualiza un patrocinador existente. Si se envía un logotipo nuevo,
     * reemplaza el archivo y elimina el anterior del disco.
     */
    public function actualizar(
        Patrocinador $patrocinador,
        array $datos,
        ?UploadedFile $logotipo
    ): Patrocinador {
        if ($logotipo !== null) {
            $logotipoAnterior = $patrocinador->logotipo;
            $datos['logotipo'] = $logotipo->store(self::DIRECTORIO_LOGOTIPOS, 'public');

            if ($logotipoAnterior) {
                Storage::disk('public')->delete($logotipoAnterior);
            }
        }

        $patrocinador->update($datos);

        return $patrocinador->refresh();
    }

    /**
     * Elimina un patrocinador y su logotipo del disco.
     */
    public function eliminar(Patrocinador $patrocinador): void
    {
        $logotipo = $patrocinador->logotipo;

        $patrocinador->delete();

        if ($logotipo) {
            Storage::disk('public')->delete($logotipo);
        }
    }

    /**
     * Aplica un nuevo orden a un lote de patrocinadores (drag and drop).
     *
     * @param array<int, array{id_patrocinador: int, orden: int}> $items
     */
    public function reordenar(array $items): void
    {
        foreach ($items as $item) {
            Patrocinador::query()
                ->where('id_patrocinador', $item['id_patrocinador'])
                ->update(['orden' => $item['orden']]);
        }
    }

    private function siguienteOrden(): int
    {
        return (int) (Patrocinador::query()->max('orden') ?? -1) + 1;
    }
}
