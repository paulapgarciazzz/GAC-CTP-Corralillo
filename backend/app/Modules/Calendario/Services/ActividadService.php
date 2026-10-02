<?php

namespace App\Modules\Calendario\Services;

use App\Modules\Calendario\Models\Actividad;
use App\Modules\Calendario\Models\EstadoActividad;
use App\Modules\Calendario\Models\Evento;
use App\Modules\SolicitudesAgrupaciones\Models\Agrupacion;
use App\Modules\SolicitudesAgrupaciones\Models\SolicitudAgrupacion;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class ActividadService
{
    private const RELACIONES = ['ubicacion', 'estado', 'agrupacion'];

    /**
     * @var array<string, int>|null
     */
    private ?array $idsEstados = null;

    /**
     * Obtiene todas las actividades.
     */
    public function listar(): Collection
    {
        $this->sincronizarEstados();

        return Actividad::query()
            ->with(self::RELACIONES)
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get();
    }

    /**
     * Obtiene las actividades de un evento.
     */
    public function listarPorEvento(Evento $evento): Collection
    {
        $this->sincronizarEstados($evento->id_evento);

        return $evento->actividades()
            ->with(self::RELACIONES)
            ->orderBy('fecha')
            ->orderBy('hora_inicio')
            ->get();
    }

    /**
     * Obtiene una actividad por su ID.
     */
    public function obtenerPorId(int $id): Actividad
    {
        $actividad = Actividad::query()->findOrFail($id);

        $this->sincronizarEstado($actividad);

        return $actividad->load(self::RELACIONES);
    }

    /**
     * Crea una nueva actividad.
     */
    public function crear(array $datos): Actividad
    {
        $this->validarReglas($datos);

        $datos['id_estado_actividad'] = $this->calcularEstado(
            $datos['fecha'],
            $datos['hora_inicio'],
            $datos['hora_finalizacion']
        );

        return Actividad::create($datos)
            ->refresh()
            ->load(self::RELACIONES);
    }

    /**
     * Actualiza una actividad existente.
     */
    public function actualizar(Actividad $actividad, array $datos): Actividad
    {
        $completos = array_merge($this->datosActuales($actividad), $datos);

        $this->validarReglas($completos, $actividad->id_actividad);

        $datos['id_estado_actividad'] = $this->calcularEstado(
            $completos['fecha'],
            $completos['hora_inicio'],
            $completos['hora_finalizacion']
        );

        $actividad->update($datos);

        return $actividad->refresh()->load(self::RELACIONES);
    }

    /**
     * Crea una copia de la actividad en otro evento (o en el mismo).
     * Se pueden cambiar la fecha, las horas y la ubicación. Si la agrupación
     * no tiene una solicitud aprobada en el evento destino, se copia sin agrupación.
     */
    public function duplicar(Actividad $original, array $datos): Actividad
    {
        $actuales = $this->datosActuales($original);

        $idAgrupacion = $actuales['id_agrupacion'];

        if (
            $idAgrupacion !== null
            && ! $this->agrupacionAprobadaEnEvento($idAgrupacion, (int) $datos['id_evento'])
        ) {
            $idAgrupacion = null;
        }

        return $this->crear([
            'titulo' => $actuales['titulo'],
            'fecha' => $datos['fecha'],
            'hora_inicio' => $datos['hora_inicio'] ?? $actuales['hora_inicio'],
            'hora_finalizacion' => $datos['hora_finalizacion'] ?? $actuales['hora_finalizacion'],
            'id_ubicacion' => array_key_exists('id_ubicacion', $datos)
                ? $datos['id_ubicacion']
                : $actuales['id_ubicacion'],
            'id_evento' => (int) $datos['id_evento'],
            'id_agrupacion' => $idAgrupacion,
        ]);
    }

    /**
     * Elimina una actividad.
     */
    public function eliminar(Actividad $actividad): void
    {
        $actividad->delete();
    }

    /**
     * Obtiene el catálogo de estados de actividad.
     */
    public function listarEstados(): Collection
    {
        return EstadoActividad::query()
            ->orderBy('id_estado_actividad')
            ->get();
    }

    /**
     * Obtiene las agrupaciones con una solicitud aprobada para el evento.
     */
    public function listarAgrupacionesAprobadas(Evento $evento): Collection
    {
        return Agrupacion::query()
            ->whereHas('solicitudes', function ($query) use ($evento) {
                $this->filtrarSolicitudesAprobadas($query, $evento->id_evento);
            })
            ->orderBy('nombre')
            ->get(['id', 'nombre']);
    }

    /**
     * Valida las reglas de negocio de una actividad con sus datos completos.
     */
    private function validarReglas(array $datos, ?int $ignorarId = null): void
    {
        $inicio = substr($datos['hora_inicio'], 0, 5);
        $fin = substr($datos['hora_finalizacion'], 0, 5);

        if ($fin <= $inicio) {
            throw ValidationException::withMessages([
                'hora_finalizacion' => 'La hora de finalización debe ser posterior a la hora de inicio.',
            ]);
        }

        $evento = Evento::query()->findOrFail($datos['id_evento']);
        $fecha = $datos['fecha'];

        if (
            $fecha < $evento->fecha_inicio->format('Y-m-d')
            || $fecha > $evento->fecha_fin->format('Y-m-d')
        ) {
            throw ValidationException::withMessages([
                'fecha' => 'La fecha de la actividad debe estar dentro de las fechas del evento.',
            ]);
        }

        if (! empty($datos['id_ubicacion'])) {
            $hayChoque = Actividad::query()
                ->where('id_ubicacion', $datos['id_ubicacion'])
                ->where('fecha', $fecha)
                ->where('hora_inicio', '<', $fin)
                ->where('hora_finalizacion', '>', $inicio)
                ->when($ignorarId, fn ($query) => $query->where('id_actividad', '!=', $ignorarId))
                ->exists();

            if ($hayChoque) {
                throw ValidationException::withMessages([
                    'id_ubicacion' => 'La ubicación ya tiene otra actividad en ese horario.',
                ]);
            }
        }

        if (
            ! empty($datos['id_agrupacion'])
            && ! $this->agrupacionAprobadaEnEvento((int) $datos['id_agrupacion'], (int) $datos['id_evento'])
        ) {
            throw ValidationException::withMessages([
                'id_agrupacion' => 'La agrupación no tiene una solicitud aprobada para este evento.',
            ]);
        }
    }

    private function agrupacionAprobadaEnEvento(int $idAgrupacion, int $idEvento): bool
    {
        return $this->filtrarSolicitudesAprobadas(
            SolicitudAgrupacion::query()->where('id_agrupacion', $idAgrupacion),
            $idEvento
        )->exists();
    }

    private function filtrarSolicitudesAprobadas(Builder $query, int $idEvento): Builder
    {
        return $query
            ->where('id_evento', $idEvento)
            ->whereHas('estado', function ($query) {
                $query->where('nom_estado', 'aprobada');
            });
    }

    /**
     * Determina el estado según la fecha y hora actuales.
     */
    private function calcularEstado(string $fecha, string $horaInicio, string $horaFin): int
    {
        $ahora = now();
        $inicio = Carbon::parse($fecha . ' ' . substr($horaInicio, 0, 5));
        $fin = Carbon::parse($fecha . ' ' . substr($horaFin, 0, 5));

        $nombre = match (true) {
            $ahora->lt($inicio) => EstadoActividad::PROXIMAMENTE,
            $ahora->lt($fin) => EstadoActividad::EN_PROGRESO,
            default => EstadoActividad::FINALIZADA,
        };

        return $this->idsEstados()[$nombre];
    }

    /**
     * @return array<string, int>
     */
    private function idsEstados(): array
    {
        return $this->idsEstados ??= EstadoActividad::query()
            ->pluck('id_estado_actividad', 'nombre')
            ->all();
    }

    private function sincronizarEstado(Actividad $actividad): void
    {
        $actuales = $this->datosActuales($actividad);

        $idEstado = $this->calcularEstado(
            $actuales['fecha'],
            $actuales['hora_inicio'],
            $actuales['hora_finalizacion']
        );

        if ((int) $actividad->id_estado_actividad !== $idEstado) {
            $actividad->update(['id_estado_actividad' => $idEstado]);
        }
    }

    /**
     * Actualiza en bloque el estado de las actividades (opcionalmente de un evento).
     * Son siempre 3 consultas, sin importar cuántas actividades existan, y solo
     * se modifican las filas cuyo estado cambió. Usa los mismos límites que calcularEstado().
     */
    private function sincronizarEstados(?int $idEvento = null): void
    {
        $ahora = now()->format('Y-m-d H:i:s');
        $ids = $this->idsEstados();

        $condiciones = [
            EstadoActividad::FINALIZADA => fn (Builder $query) => $query
                ->whereRaw('TIMESTAMP(fecha, hora_finalizacion) <= ?', [$ahora]),
            EstadoActividad::EN_PROGRESO => fn (Builder $query) => $query
                ->whereRaw('TIMESTAMP(fecha, hora_inicio) <= ?', [$ahora])
                ->whereRaw('TIMESTAMP(fecha, hora_finalizacion) > ?', [$ahora]),
            EstadoActividad::PROXIMAMENTE => fn (Builder $query) => $query
                ->whereRaw('TIMESTAMP(fecha, hora_inicio) > ?', [$ahora]),
        ];

        foreach ($condiciones as $nombre => $condicion) {
            Actividad::query()
                ->when($idEvento, fn (Builder $query) => $query->where('id_evento', $idEvento))
                ->where('id_estado_actividad', '!=', $ids[$nombre])
                ->tap($condicion)
                ->update(['id_estado_actividad' => $ids[$nombre]]);
        }
    }

    private function datosActuales(Actividad $actividad): array
    {
        return [
            'titulo' => $actividad->titulo,
            'fecha' => $actividad->fecha->format('Y-m-d'),
            'hora_inicio' => substr($actividad->hora_inicio, 0, 5),
            'hora_finalizacion' => substr($actividad->hora_finalizacion, 0, 5),
            'id_ubicacion' => $actividad->id_ubicacion,
            'id_evento' => $actividad->id_evento,
            'id_agrupacion' => $actividad->id_agrupacion,
        ];
    }
}
