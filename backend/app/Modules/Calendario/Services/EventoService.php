<?php

namespace App\Modules\Calendario\Services;

use App\Modules\Calendario\Models\Evento;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
     * Actualiza un evento existente. No permite cambios de fechas u horario
     * que dejen actividades del evento fuera de él.
     */
    public function actualizar(Evento $evento, array $datos): Evento
    {
        return DB::transaction(function () use ($evento, $datos) {
            $evento = Evento::query()->lockForUpdate()->findOrFail($evento->id_evento);

            $evento->fill($datos);
            $this->validarActividadesDentro($evento);
            $evento->save();

            return $evento->refresh();
        });
    }

    /**
     * Valida que las actividades del evento queden dentro de sus fechas y horario.
     */
    private function validarActividadesDentro(Evento $evento): void
    {
        if (! $evento->isDirty(['fecha_inicio', 'fecha_fin', 'hora_inicio', 'hora_fin', 'todo_el_dia'])) {
            return;
        }

        $fueraDeFechas = $evento->actividades()
            ->where(fn ($query) => $query
                ->where('fecha', '<', $evento->fecha_inicio->format('Y-m-d'))
                ->orWhere('fecha', '>', $evento->fecha_fin->format('Y-m-d')))
            ->count();

        if ($fueraDeFechas > 0) {
            throw ValidationException::withMessages([
                'fecha_fin' => $this->mensajeActividadesFuera($fueraDeFechas, 'del nuevo rango de fechas'),
            ]);
        }

        if ($evento->todo_el_dia || ! $evento->hora_inicio) {
            return;
        }

        $horaInicio = substr($evento->hora_inicio, 0, 5);
        $horaFin = $evento->hora_fin ? substr($evento->hora_fin, 0, 5) : null;

        $fueraDeHorario = $evento->actividades()
            ->where(fn ($query) => $query
                ->where('hora_inicio', '<', $horaInicio)
                ->when($horaFin, fn ($query) => $query->orWhere('hora_finalizacion', '>', $horaFin)))
            ->count();

        if ($fueraDeHorario > 0) {
            throw ValidationException::withMessages([
                'hora_inicio' => $this->mensajeActividadesFuera($fueraDeHorario, 'del nuevo horario'),
            ]);
        }
    }

    private function mensajeActividadesFuera(int $cantidad, string $limite): string
    {
        $actividades = $cantidad === 1 ? '1 actividad' : "{$cantidad} actividades";

        return "Hay {$actividades} fuera {$limite} del evento. Muévalas o elimínelas antes de cambiarlo.";
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
