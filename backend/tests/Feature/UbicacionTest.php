<?php

namespace Tests\Feature;

use App\Modules\Calendario\Models\Actividad;
use App\Modules\Calendario\Models\EstadoActividad;
use App\Modules\Calendario\Models\Evento;
use App\Modules\Calendario\Models\Ubicacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UbicacionTest extends TestCase
{
    use RefreshDatabase;

    private const IMAGEN = 'data:image/png;base64,iVBORw0KGgo=';

    public function test_crea_lista_muestra_y_actualiza_ubicaciones(): void
    {
        $respuesta = $this->postJson('/api/ubicaciones', [
            'nombre' => 'Tarima Principal',
            'descripcion' => 'Frente al gimnasio',
            'capacidad' => 300,
            'imagen' => self::IMAGEN,
        ]);

        $respuesta->assertCreated()
            ->assertJsonPath('data.nombre', 'Tarima Principal')
            ->assertJsonPath('data.capacidad', 300)
            ->assertJsonPath('data.imagen', self::IMAGEN);

        $id = $respuesta->json('data.id_ubicacion');

        $this->postJson('/api/ubicaciones', [
            'nombre' => 'Aula 1',
            'capacidad' => 40,
        ])->assertCreated()
            ->assertJsonPath('data.descripcion', null)
            ->assertJsonPath('data.imagen', null);

        $this->getJson('/api/ubicaciones')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.nombre', 'Aula 1');

        $this->getJson("/api/ubicaciones/{$id}")
            ->assertOk()
            ->assertJsonPath('data.descripcion', 'Frente al gimnasio');

        $this->patchJson("/api/ubicaciones/{$id}", [
            'nombre' => 'Tarima Principal',
            'capacidad' => 350,
            'imagen' => null,
        ])->assertOk()
            ->assertJsonPath('data.capacidad', 350)
            ->assertJsonPath('data.imagen', null);
    }

    public function test_valida_nombre_unico_capacidad_e_imagen(): void
    {
        $existente = Ubicacion::create(['nombre' => 'Gimnasio', 'capacidad' => 500]);
        $otra = Ubicacion::create(['nombre' => 'Biblioteca', 'capacidad' => 30]);

        $this->postJson('/api/ubicaciones', [
            'nombre' => 'Gimnasio',
            'capacidad' => 0,
            'imagen' => 'no-es-una-imagen',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['nombre', 'capacidad', 'imagen']);

        $this->postJson('/api/ubicaciones', [
            'nombre' => 'Salón',
            'capacidad' => 20,
            'imagen' => 'data:application/pdf;base64,JVBERi0=',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['imagen']);

        $this->patchJson("/api/ubicaciones/{$otra->id_ubicacion}", [
            'nombre' => $existente->nombre,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['nombre']);
    }

    public function test_eliminar_ubicacion_deja_actividades_sin_ubicacion(): void
    {
        $ubicacion = Ubicacion::create(['nombre' => 'Gimnasio', 'capacidad' => 500]);
        $evento = Evento::create([
            'nombre' => 'Festival',
            'fecha_inicio' => '2026-10-10',
            'fecha_fin' => '2026-10-10',
        ]);
        $actividad = Actividad::create([
            'titulo' => 'Apertura',
            'fecha' => '2026-10-10',
            'hora_inicio' => '10:00',
            'hora_finalizacion' => '11:00',
            'id_ubicacion' => $ubicacion->id_ubicacion,
            'id_evento' => $evento->id_evento,
            'id_estado_actividad' => EstadoActividad::query()
                ->where('nombre', EstadoActividad::PROXIMAMENTE)
                ->value('id_estado_actividad'),
        ]);

        $this->deleteJson("/api/ubicaciones/{$ubicacion->id_ubicacion}")
            ->assertOk();

        $this->assertDatabaseMissing('ubicacion', ['id_ubicacion' => $ubicacion->id_ubicacion]);
        $this->assertDatabaseHas('actividad', [
            'id_actividad' => $actividad->id_actividad,
            'id_ubicacion' => null,
        ]);
    }
}
