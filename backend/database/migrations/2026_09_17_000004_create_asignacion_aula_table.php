<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_aula', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_aula');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios', 'fk_asignacion_aula_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->onDelete('cascade');

            $table->foreign('id_aula', 'fk_asignacion_aula_aula')
                ->references('id_aula')
                ->on('aula')
                ->onDelete('restrict');

            $table->index('id_asignacion_beneficios', 'idx_asignacion_aula_asignacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_aula');
    }
};
