<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoSeeder extends Seeder
{
    /**
     * Inserta o actualiza los estados iniciales de las solicitudes.
     */
    public function run(): void
    {
        DB::table('estado')->upsert(
            [
                [
                    'nom_estado' => 'pendiente',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nom_estado' => 'aprobada',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'nom_estado' => 'rechazada',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ],
            ['nom_estado'],
            ['updated_at']
        );
    }
}