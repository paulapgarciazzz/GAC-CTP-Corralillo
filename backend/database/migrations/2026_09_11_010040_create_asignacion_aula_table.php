<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_aula', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_aula');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->cascadeOnDelete();
            $table->foreign('id_aula')
                ->references('id_aula')
                ->on('aula');
            $table->unique(
                ['id_asignacion_beneficios', 'id_aula'],
                'asignacion_aula_asignacion_aula_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_aula');
    }
};
