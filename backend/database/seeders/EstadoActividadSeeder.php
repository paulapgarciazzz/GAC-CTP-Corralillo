<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoActividadSeeder extends Seeder
{
    /**
     * Inserta o actualiza los estados fijos de las actividades.
     */
    public function run(): void
    {
        DB::table('estado_actividad')->upsert(
            [
                [
                    'nombre' => 'proximamente',
                    'descripcion' => 'La actividad aún no ha iniciado.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'en progreso',
                    'descripcion' => 'La actividad se está realizando.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nombre' => 'finalizada',
                    'descripcion' => 'La actividad ya terminó.',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ],
            ['nombre'],
            ['descripcion', 'updated_at']
        );
    }
}
