<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        Schema::table('agrupacion', function (Blueprint $table) {
            $table->longText('archivo_adjunto')
                ->nullable()
                ->after('foto_url');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('agrupacion', function (Blueprint $table) {
            $table->dropColumn('archivo_adjunto');
        });
    }
};
