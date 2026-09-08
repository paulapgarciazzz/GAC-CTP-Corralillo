<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('solicitud_beneficios', function (Blueprint $table) {
             $table->id('id_solicitud_beneficios');
             $table->unsignedBigInteger('id_agrupacion');
             $table->unsignedBigInteger('id_solicitud_alimentacion')->nullable();
             $table->unsignedBigInteger('id_solicitud_mobiliario')->nullable();
             $table->unsignedBigInteger('id_tarima')->nullable();
             $table->unsignedBigInteger('id_aula')->nullable();
             $table->unsignedBigInteger('id_solicitud_transporte')->nullable();
             $table->date('fecha_solicitud')->nullable();

             $table->foreign('id_agrupacion')
                ->references('id')
                ->on('agrupacion');
             $table->foreign('id_solicitud_alimentacion')
                ->references('id_solicitud_alimentacion')
                ->on('solicitud_alimentacion');
            $table->foreign('id_solicitud_mobiliario')
                ->references('id_solicitud_mobiliario')
                ->on('solicitud_mobiliario');
            $table->foreign('id_tarima')
                ->references('id_tarima')
                ->on('tarima');
            $table->foreign('id_aula')
                ->references('id_aula')
                ->on('aula');
            $table->foreign('id_solicitud_transporte')
                ->references('id_solicitud_transporte')
                ->on('solicitud_transporte');


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_beneficios');
    }
};
