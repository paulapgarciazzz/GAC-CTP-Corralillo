<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AlimentacionSeeder extends Seeder
{
    public function run(): void{
        DB::table('alimentacion')->upsert([
            [
                'tiempo_comida' => 'desayuno',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tiempo_comida' => 'almuerzo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tiempo_comida' => 'cena',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ],
        ['tiempo_comida'],
        ['updated_at']);
    }
}
