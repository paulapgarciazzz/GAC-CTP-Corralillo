<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_mobiliario', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_mobiliario');
            $table->unsignedInteger('cantidad');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->cascadeOnDelete();
            $table->foreign('id_mobiliario')
                ->references('id_mobiliario')
                ->on('mobiliario');
            $table->unique(
                ['id_asignacion_beneficios', 'id_mobiliario'],
                'asignacion_mobiliario_asignacion_mobiliario_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_mobiliario');
    }
};
