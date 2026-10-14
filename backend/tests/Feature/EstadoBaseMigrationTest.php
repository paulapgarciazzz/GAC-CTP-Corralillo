<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class EstadoBaseMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_migracion_crea_estados_base_sin_duplicar_ni_cambiar_ids(): void
    {
        $ahora = now();
        DB::table('estado')->whereIn('nom_estado', [
            'pendiente',
            'aprobada',
            'rechazada',
        ])->delete();

        $idPendiente = DB::table('estado')->insertGetId([
            'nom_estado' => 'pendiente',
            'created_at' => $ahora,
            'updated_at' => $ahora,
        ]);
        $idAdicional = DB::table('estado')->insertGetId([
            'nom_estado' => 'en_revision',
            'created_at' => $ahora,
            'updated_at' => $ahora,
        ]);

        $migracion = require database_path(
            'migrations/2026_09_11_000000_ensure_base_estados_exist.php'
        );
        $migracion->up();
        $migracion->up();

        $this->assertDatabaseHas('estado', ['nom_estado' => 'pendiente']);
        $this->assertDatabaseHas('estado', ['nom_estado' => 'aprobada']);
        $this->assertDatabaseHas('estado', ['nom_estado' => 'rechazada']);
        $this->assertDatabaseHas('estado', ['id' => $idAdicional, 'nom_estado' => 'en_revision']);
        $this->assertSame(
            $idPendiente,
            DB::table('estado')->where('nom_estado', 'pendiente')->value('id')
        );
        $this->assertSame(4, DB::table('estado')->count());
    }
}
