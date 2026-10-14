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
        Schema::create('actividad', function (Blueprint $table) {
            $table->id('id_actividad');

            $table->string('titulo', 150);

            $table->date('fecha');

            $table->time('hora_inicio');

            $table->time('hora_finalizacion');

            $table->unsignedBigInteger('id_ubicacion')->nullable();

            $table->unsignedBigInteger('id_estado_actividad');

            $table->unsignedBigInteger('id_evento');

            // Nullable: la actividad puede o no tener una presentación artística
            $table->unsignedBigInteger('id_agrupacion')->nullable();

            $table->timestamps();

            $table->foreign('id_ubicacion', 'fk_actividad_ubicacion')
                ->references('id_ubicacion')
                ->on('ubicacion')
                ->nullOnDelete();

            $table->foreign('id_estado_actividad', 'fk_actividad_estado_actividad')
                ->references('id_estado_actividad')
                ->on('estado_actividad')
                ->restrictOnDelete();

            $table->foreign('id_evento', 'fk_actividad_evento')
                ->references('id_evento')
                ->on('evento')
                ->cascadeOnDelete();

            $table->foreign('id_agrupacion', 'fk_actividad_agrupacion')
                ->references('id')
                ->on('agrupacion')
                ->nullOnDelete();

            $table->index(['id_ubicacion', 'fecha'], 'idx_actividad_ubicacion_fecha');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('actividad');
    }
};
