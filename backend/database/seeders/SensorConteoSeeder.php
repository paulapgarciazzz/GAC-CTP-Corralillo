<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SensorConteoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sensor_conteo')->upsert([
            [
                'nombre' => 'Entrada principal',
                'tipo' => 'entrada',
                'codigo' => 'ENTRADA-01',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Salida principal',
                'tipo' => 'salida',
                'codigo' => 'SALIDA-01',
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['codigo'], ['nombre', 'tipo', 'updated_at']);
    }
}
