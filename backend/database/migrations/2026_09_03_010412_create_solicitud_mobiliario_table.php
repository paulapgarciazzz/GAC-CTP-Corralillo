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
        Schema::create('solicitud_mobiliario', function (Blueprint $table) {
            $table->id('id_solicitud_mobiliario');
            $table->integer('cantidad');
            $table->unsignedBigInteger('id_sol_mobiliario');

            $table->foreign('id_sol_mobiliario')
                ->references('id_mobiliario')
                ->on('mobiliario');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_mobiliario');
    }
};
