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
        Schema::create('solicitud_alimentacion', function (Blueprint $table): void {
            $table->id('id_solicitud_alimentacion');
            $table->unsignedBigInteger('id_alimentacion');
            $table->timestamps();

            $table->foreign('id_alimentacion')
                ->references('id_alimentacion')
                ->on('alimentacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitud_alimentacion');
    }
};
