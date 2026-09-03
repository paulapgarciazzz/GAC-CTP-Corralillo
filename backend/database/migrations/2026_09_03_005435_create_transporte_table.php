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
        Schema::create('transporte', function (Blueprint $table) {
            $table->string('matricula', 6)->primary();
            $table->string('tipo', 20);
            $table->integer('capacidad')->unsigned();
            $table->string('cedula_conductor', 10);
            $table->string('nombre_conductor', 100);
            $table->string('apellido_conductor', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transporte');
    }
};
