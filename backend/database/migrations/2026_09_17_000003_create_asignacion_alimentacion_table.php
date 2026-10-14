<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_alimentacion', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_alimentacion');
            $table->unsignedInteger('cantidad');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios', 'fk_asignacion_alimentacion_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->onDelete('cascade');

            $table->foreign('id_alimentacion', 'fk_asignacion_alimentacion_alimentacion')
                ->references('id_alimentacion')
                ->on('alimentacion')
                ->onDelete('restrict');

            $table->index('id_asignacion_beneficios', 'idx_asignacion_alimentacion_asignacion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_alimentacion');
    }
};
