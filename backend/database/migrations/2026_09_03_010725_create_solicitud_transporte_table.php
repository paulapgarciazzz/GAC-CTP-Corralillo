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
        Schema::create('solicitud_transporte', function (Blueprint $table) {
            $table->id('id_solicitud_transporte');
            $table->string('matricula', 6);
            $table->unsignedBigInteger('id_ruta');
            $table->timestamps();

            $table->foreign('matricula')
                ->references('matricula')
                ->on('transporte');
            $table->foreign('id_ruta')
                ->references('id_ruta')
                ->on('ruta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_transporte');
    }
};
