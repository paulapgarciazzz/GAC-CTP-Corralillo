<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Modules\SolicitudesAgrupaciones\Controllers\AgrupacionController;
use App\Modules\SolicitudesAgrupaciones\Controllers\EncargadoController;
use App\Modules\SolicitudesAgrupaciones\Controllers\SolicitudAgrupacionController;

Route::pattern('agrupacion', '[0-9]+');
Route::pattern('id', '[0-9]+');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return response()->json(['message' => 'API funcionando correctamente!']);
});

Route::prefix('encargados')->group(function () {
    Route::post('/', [EncargadoController::class, 'store']);
    Route::get('/{cedula}', [EncargadoController::class, 'show']);
    Route::get('/{cedula}/agrupaciones', [AgrupacionController::class, 'index']);
});

Route::apiResource('agrupaciones', AgrupacionController::class)
    ->only(['store', 'show', 'update'])
    ->parameters(['agrupaciones' => 'agrupacion']);
Route::post(
    'agrupaciones/{agrupacion}/participaciones',
    [AgrupacionController::class, 'participaciones']
);

Route::prefix('solicitudes-agrupaciones')->group(function () {
    Route::get('/', [SolicitudAgrupacionController::class, 'index']);
    Route::post('/', [SolicitudAgrupacionController::class, 'store']);
    Route::get('/{id}', [SolicitudAgrupacionController::class, 'show']);
    Route::patch('/{id}/aprobar', [SolicitudAgrupacionController::class, 'aprobar']);
    Route::patch('/{id}/rechazar', [SolicitudAgrupacionController::class, 'rechazar']);
});