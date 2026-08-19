<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Ejecuta los seeders de la aplicación.
     */
    public function run(): void
    {
        $this->call([
            EstadoSeeder::class,
        ]);
    }
}