<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_tarima', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_tarima');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios', 'fk_asignacion_tarima_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->onDelete('cascade');

            $table->foreign('id_tarima', 'fk_asignacion_tarima_tarima')
                ->references('id_tarima')
                ->on('tarima')
                ->onDelete('restrict');

            $table->index('id_asignacion_beneficios', 'idx_asignacion_tarima_asignacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_tarima');
    }
};
