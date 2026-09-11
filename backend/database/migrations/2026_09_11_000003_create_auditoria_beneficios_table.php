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
        Schema::create('auditoria_beneficios', function (Blueprint $table) {
            $table->id();
            $table->string('tabla_afectada', 50);
            $table->string('id_registro', 20);
            $table->string('accion', 20);
            $table->string('tipo_beneficio', 20)->nullable();
            $table->unsignedBigInteger('id_agrupacion')->nullable();
            $table->unsignedBigInteger('id_asignacion_beneficios')->nullable();
            $table->unsignedBigInteger('id_referencia')->nullable();
            $table->date('fecha_solicitud')->nullable();
            $table->dateTime('fecha_accion');
            $table->timestamps();

            $table->foreign('id_agrupacion')
                ->references('id')
                ->on('agrupacion')
                ->nullOnDelete();

            $table->foreign('id_asignacion_beneficios')
                ->references('id_solicitud_beneficios')
                ->on('asignacion_beneficios')
                ->nullOnDelete();

            $table->index(['tabla_afectada', 'fecha_accion']);
            $table->index(['tipo_beneficio', 'fecha_solicitud']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auditoria_beneficios');
    }
};
