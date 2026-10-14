<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_transporte', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->string('matricula', 6);
            $table->unsignedBigInteger('id_ruta');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios', 'fk_asignacion_transporte_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->onDelete('cascade');

            $table->foreign('matricula', 'fk_asignacion_transporte_transporte')
                ->references('matricula')
                ->on('transporte')
                ->onDelete('restrict');

            $table->foreign('id_ruta', 'fk_asignacion_transporte_ruta')
                ->references('id_ruta')
                ->on('ruta')
                ->onDelete('restrict');

            $table->index('id_asignacion_beneficios', 'idx_asignacion_transporte_asignacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_transporte');
    }
};
