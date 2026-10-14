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
        Schema::table('encargado', function (Blueprint $table) {
            $table->unique('numero_tel');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('encargado', function (Blueprint $table) {
            $table->dropUnique('encargado_numero_tel_unique');
        });
    }
};
