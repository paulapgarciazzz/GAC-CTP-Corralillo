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
        Schema::create('solicitud_agrupacion', function (Blueprint $table) {
            $table->id();

            $table->string('ced_encargado', 20);
            $table->unsignedBigInteger('id_agrupacion');
            $table->dateTime('fecha_solicitud');
            $table->unsignedBigInteger('id_estado');

            $table->foreign('ced_encargado')
                ->references('cedula')
                ->on('encargado');

            $table->foreign('id_agrupacion')
                ->references('id')
                ->on('agrupacion');

            $table->foreign('id_estado')
                ->references('id')
                ->on('estado');

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_agrupacion');
    }
};