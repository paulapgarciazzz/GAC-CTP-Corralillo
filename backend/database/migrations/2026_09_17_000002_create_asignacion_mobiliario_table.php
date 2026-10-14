<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_mobiliario', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_mobiliario');
            $table->unsignedInteger('cantidad');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios', 'fk_asignacion_mobiliario_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->onDelete('cascade');

            $table->foreign('id_mobiliario', 'fk_asignacion_mobiliario_mobiliario')
                ->references('id_mobiliario')
                ->on('mobiliario')
                ->onDelete('restrict');

            $table->index('id_asignacion_beneficios', 'idx_asignacion_mobiliario_asignacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_mobiliario');
    }
};
