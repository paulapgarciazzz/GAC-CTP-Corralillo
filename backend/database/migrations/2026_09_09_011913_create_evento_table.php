<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        Schema::create('evento', function (Blueprint $table) {
            $table->id('id_evento');

            $table->string('nombre', 100);

            $table->date('fecha_inicio');

            $table->date('fecha_fin');

            // 1 = activo, 0 = inactivo
            $table->boolean('estado')
                ->default(true);

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('evento');
    }
};