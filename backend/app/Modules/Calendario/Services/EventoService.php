<?php

namespace App\Modules\Calendario\Services;

use App\Modules\Calendario\Models\Evento;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Exceptions\HttpResponseException;

class EventoService
{
    /**
     * Obtiene todos los eventos.
     */
    public function listar(): Collection
    {
        return Evento::query()
            ->orderBy('fecha_inicio')
            ->orderBy('hora_inicio')
            ->get();
    }

    /**
     * Obtiene un evento por su ID.
     */
    public function obtenerPorId(int $id): Evento
    {
        return Evento::query()
            ->findOrFail($id);
    }

    /**
     * Crea un nuevo evento.
     */
    public function crear(array $datos): Evento
    {
        return Evento::create($datos)->refresh();
    }

    /**
     * Actualiza un evento existente.
     */
    public function actualizar(Evento $evento, array $datos): Evento
    {
        $evento->update($datos);

        return $evento->refresh();
    }

    /**
     * Elimina un evento si no tiene solicitudes asociadas.
     */
    public function eliminar(Evento $evento): void
    {
        if ($evento->solicitudes()->exists()) {
            throw new HttpResponseException(response()->json([
                'message' => 'No se puede eliminar el evento porque tiene solicitudes asociadas.',
            ], 409));
        }

        $evento->delete();
    }
}
