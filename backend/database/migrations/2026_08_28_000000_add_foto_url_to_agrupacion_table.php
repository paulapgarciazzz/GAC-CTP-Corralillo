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
            $table->longText('foto_url')
                ->nullable()
                ->after('resena');
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('agrupacion', function (Blueprint $table) {
            $table->dropColumn('foto_url');
        });
    }
};
