<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlimentacionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('alimentacion')->upsert([
            [
                'tiempo_comida' => 'Desayuno',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tiempo_comida' => 'Almuerzo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tiempo_comida' => 'Cena',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ], ['tiempo_comida'], ['updated_at']);
    }
}
