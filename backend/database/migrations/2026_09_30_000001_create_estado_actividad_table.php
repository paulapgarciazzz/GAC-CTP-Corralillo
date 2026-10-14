<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        Schema::create('estado_actividad', function (Blueprint $table) {
            $table->id('id_estado_actividad');

            $table->string('nombre', 50)->unique();

            $table->string('descripcion', 255)->nullable();

            $table->timestamps();
        });

        // Los estados son fijos: se insertan aquí para que existan
        // aunque no se ejecuten los seeders (por ejemplo, en pruebas).
        $ahora = now();

        foreach ([
            'proximamente' => 'La actividad aún no ha iniciado.',
            'en progreso' => 'La actividad se está realizando.',
            'finalizada' => 'La actividad ya terminó.',
        ] as $nombre => $descripcion) {
            DB::table('estado_actividad')->updateOrInsert(
                ['nombre' => $nombre],
                [
                    'descripcion' => $descripcion,
                    'created_at' => $ahora,
                    'updated_at' => $ahora,
                ]
            );
        }
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('estado_actividad');
    }
};
