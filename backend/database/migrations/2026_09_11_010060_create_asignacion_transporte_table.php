<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_transporte', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->string('matricula', 6);
            $table->unsignedBigInteger('id_ruta');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->cascadeOnDelete();
            $table->foreign('matricula')
                ->references('matricula')
                ->on('transporte');
            $table->foreign('id_ruta')
                ->references('id_ruta')
                ->on('ruta');
            $table->unique(
                ['id_asignacion_beneficios', 'matricula', 'id_ruta'],
                'asignacion_transporte_asignacion_transporte_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_transporte');
    }
};
