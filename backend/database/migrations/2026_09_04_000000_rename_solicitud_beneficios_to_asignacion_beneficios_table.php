<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::rename('solicitud_beneficios', 'asignacion_beneficios');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::rename('asignacion_beneficios', 'solicitud_beneficios');
    }
};
