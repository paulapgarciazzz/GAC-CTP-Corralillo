<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asignacion_alimentacion', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('id_asignacion_beneficios');
            $table->unsignedBigInteger('id_alimentacion');
            $table->unsignedInteger('cantidad');
            $table->timestamps();

            $table->foreign('id_asignacion_beneficios')
                ->references('id')
                ->on('asignacion_beneficios')
                ->cascadeOnDelete();
            $table->foreign('id_alimentacion')
                ->references('id_alimentacion')
                ->on('alimentacion');
            $table->unique(
                ['id_asignacion_beneficios', 'id_alimentacion'],
                'asignacion_alimentacion_asignacion_alimentacion_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asignacion_alimentacion');
    }
};
