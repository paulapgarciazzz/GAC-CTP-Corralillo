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
        Schema::create('participacion', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('id_agrupacion');

            $table->string('lugar', 150);
            $table->date('fecha');

            $table->foreign('id_agrupacion')
                ->references('id')
                ->on('agrupacion');

            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('participacion');
    }
};