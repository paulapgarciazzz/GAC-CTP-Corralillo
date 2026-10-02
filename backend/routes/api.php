<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Modules\SolicitudesAgrupaciones\Controllers\AgrupacionController;
use App\Modules\SolicitudesAgrupaciones\Controllers\EncargadoController;
use App\Modules\SolicitudesAgrupaciones\Controllers\ReporteController;
use App\Modules\SolicitudesAgrupaciones\Controllers\SolicitudAgrupacionController;

use App\Modules\Calendario\Controllers\ActividadController;
use App\Modules\Calendario\Controllers\EventoController;
use App\Modules\Calendario\Controllers\UbicacionController;

use App\Modules\Beneficios\Controllers\AlimentacionController;
use App\Modules\Beneficios\Controllers\AsignacionBeneficiosController;
use App\Modules\Beneficios\Controllers\AulaController;
use App\Modules\Beneficios\Controllers\BeneficiosReportController;
use App\Modules\Beneficios\Controllers\InventarioReportController;
use App\Modules\Beneficios\Controllers\MobiliarioController;
use App\Modules\Beneficios\Controllers\RutaController;
use App\Modules\Beneficios\Controllers\TransporteController;

Route::pattern('agrupacion', '[0-9]+');
Route::pattern('id', '[0-9]+');
Route::pattern('actividad', '[0-9]+');
Route::pattern('ubicacion', '[0-9]+');

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

Route::get(
    'agrupaciones/aprobadas',
    [AgrupacionController::class, 'listarAprobadas']
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
        '/nueva',
        [SolicitudAgrupacionController::class, 'storeNueva']
    );

    Route::post(
        '/encargado-existente',
        [SolicitudAgrupacionController::class, 'storeParaEncargadoExistente']
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

    Route::get(
        '/beneficios',
        [BeneficiosReportController::class, 'index']
    );

    Route::get(
        '/inventario',
        [InventarioReportController::class, 'index']
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
    'eventos',
    EventoController::class
);

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
    'transportes',
    TransporteController::class
);

/*
|--------------------------------------------------------------------------
| Calendario: Actividades y Ubicaciones
|--------------------------------------------------------------------------
*/

Route::apiResource(
    'ubicaciones',
    UbicacionController::class
)->parameters([
    'ubicaciones' => 'ubicacion',
]);

Route::get(
    'eventos/{evento}/actividades',
    [ActividadController::class, 'porEvento']
);

Route::get(
    'eventos/{evento}/agrupaciones-aprobadas',
    [ActividadController::class, 'agrupacionesAprobadas']
);

Route::get(
    'estados-actividad',
    [ActividadController::class, 'estados']
);

Route::post(
    'actividades/{actividad}/duplicar',
    [ActividadController::class, 'duplicar']
);

Route::apiResource(
    'actividades',
    ActividadController::class
)->parameters([
    'actividades' => 'actividad',
]);

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