<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Modules\SolicitudesAgrupaciones\Controllers\AgrupacionController;
use App\Modules\SolicitudesAgrupaciones\Controllers\EncargadoController;
use App\Modules\SolicitudesAgrupaciones\Controllers\ReporteController;
use App\Modules\SolicitudesAgrupaciones\Controllers\SolicitudAgrupacionController;

use App\Modules\Beneficios\Controllers\AlimentacionController;
use App\Modules\Beneficios\Controllers\AsignacionBeneficiosController;
use App\Modules\Beneficios\Controllers\AulaController;
use App\Modules\Beneficios\Controllers\MobiliarioController;
use App\Modules\Beneficios\Controllers\RutaController;
use App\Modules\Beneficios\Controllers\TarimaController;
use App\Modules\Beneficios\Controllers\TransporteController;

Route::pattern('agrupacion', '[0-9]+');
Route::pattern('id', '[0-9]+');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return response()->json([
        'message' => 'API funcionando correctamente!'
    ]);
});

/*
|--------------------------------------------------------------------------
| Encargados
|--------------------------------------------------------------------------
*/

Route::prefix('encargados')->group(function () {
    Route::get('/', [EncargadoController::class, 'index']);
    Route::post('/', [EncargadoController::class, 'store']);
    Route::get('/{cedula}', [EncargadoController::class, 'show']);
    Route::patch('/{cedula}', [EncargadoController::class, 'update']);
    Route::delete('/{cedula}', [EncargadoController::class, 'destroy']);
    Route::get(
        '/{cedula}/agrupaciones',
        [AgrupacionController::class, 'index']
    );
});

/*
|--------------------------------------------------------------------------
| Agrupaciones
|--------------------------------------------------------------------------
*/

Route::get(
    'agrupaciones',
    [AgrupacionController::class, 'listar']
);

Route::apiResource('agrupaciones', AgrupacionController::class)
    ->only(['store', 'show', 'update', 'destroy'])
    ->parameters([
        'agrupaciones' => 'agrupacion',
    ]);

Route::post(
    'agrupaciones/{agrupacion}/participaciones',
    [AgrupacionController::class, 'participaciones']
);

Route::get(
    'agrupaciones/{agrupacion}/archivo-adjunto',
    [AgrupacionController::class, 'archivoAdjunto']
);

/*
|--------------------------------------------------------------------------
| Solicitudes de Agrupaciones
|--------------------------------------------------------------------------
*/

Route::prefix('solicitudes-agrupaciones')->group(function () {
    Route::get(
        '/',
        [SolicitudAgrupacionController::class, 'index']
    );

    Route::post(
        '/',
        [SolicitudAgrupacionController::class, 'store']
    );

    Route::get(
        '/{id}',
        [SolicitudAgrupacionController::class, 'show']
    );

    Route::patch(
        '/{id}/aprobar',
        [SolicitudAgrupacionController::class, 'aprobar']
    );

    Route::patch(
        '/{id}/rechazar',
        [SolicitudAgrupacionController::class, 'rechazar']
    );

    Route::post(
        '/{id}/enviar-detalles',
        [SolicitudAgrupacionController::class, 'enviarDetalles']
    );

    Route::put(
        '/{id}',
        [SolicitudAgrupacionController::class, 'update']
    );

    Route::delete(
        '/{id}',
        [SolicitudAgrupacionController::class, 'destroy']
    );
});

/*
|--------------------------------------------------------------------------
| Reportes
|--------------------------------------------------------------------------
*/

Route::prefix('reportes')->group(function () {
    Route::get(
        '/agrupaciones',
        [ReporteController::class, 'agrupaciones']
    );
});

/*
|--------------------------------------------------------------------------
| Módulo de Beneficios
|--------------------------------------------------------------------------
*/

Route::apiResource(
    'alimentaciones',
    AlimentacionController::class
)->parameters([
    'alimentaciones' => 'alimentacion',
]);

Route::apiResource(
    'aulas',
    AulaController::class
);

Route::apiResource(
    'mobiliarios',
    MobiliarioController::class
);

Route::apiResource(
    'rutas',
    RutaController::class
);

Route::apiResource(
    'tarimas',
    TarimaController::class
);

Route::apiResource(
    'transportes',
    TransporteController::class
);

/*
|--------------------------------------------------------------------------
| Asignaciones de Beneficios
|--------------------------------------------------------------------------
*/

Route::prefix('asignaciones-beneficios')->group(function () {
    Route::get(
        '/',
        [AsignacionBeneficiosController::class, 'index']
    );

    Route::post(
        '/',
        [AsignacionBeneficiosController::class, 'store']
    );

    Route::get(
        '/{id}',
        [AsignacionBeneficiosController::class, 'show']
    );

    Route::patch(
        '/{asignacion}',
        [AsignacionBeneficiosController::class, 'update']
    );
});