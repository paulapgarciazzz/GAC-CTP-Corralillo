<?php

use Illuminate\Support\Facades\Route;

use App\Modules\Usuarios\Controllers\AuthController;
use App\Modules\Usuarios\Controllers\PerfilController;
use App\Modules\Usuarios\Controllers\PermisoUsuarioController;
use App\Modules\Usuarios\Controllers\RecuperacionPasswordController;
use App\Modules\Usuarios\Controllers\UsuarioController;

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
use App\Modules\Beneficios\Controllers\MobiliarioController;
use App\Modules\Beneficios\Controllers\RutaController;
use App\Modules\Beneficios\Controllers\TransporteController;

use App\Modules\Personalizacion\Patrocinadores\Controllers\ConfiguracionPatrocinadoresController;
use App\Modules\Personalizacion\Patrocinadores\Controllers\PatrocinadorController;
use App\Modules\Personalizacion\Patrocinadores\Controllers\PatrocinadorPublicoController;
use App\Modules\Personalizacion\Configuracion\Controllers\FotoPersonalizacionController;
use App\Modules\Personalizacion\Configuracion\Controllers\PersonalizacionController;
use App\Modules\Personalizacion\Configuracion\Controllers\PersonalizacionPublicaController;
use App\Modules\Personalizacion\Configuracion\Controllers\VistaPreviaCorreoController;
use App\Modules\Personalizacion\Configuracion\Support\Predeterminados;

Route::pattern('agrupacion', '[0-9]+');
Route::pattern('id', '[0-9]+');
Route::pattern('actividad', '[0-9]+');
Route::pattern('ubicacion', '[0-9]+');
Route::pattern('patrocinador', '[0-9]+');
Route::pattern('usuario', '[0-9]+');
Route::pattern('foto', '[0-9]+');

/*
|--------------------------------------------------------------------------
| Permisos
|--------------------------------------------------------------------------
| Las rutas del panel exigen sesión (auth:sanctum) y el permiso
| "{modulo}.{accion}" de la acción que realizan. El rol admin pasa todos los
| chequeos (Gate::before en AppServiceProvider). Las rutas públicas son las que
| usa la landing sin sesión; están marcadas como "Público".
*/

/*
|--------------------------------------------------------------------------
| Autenticación y perfil
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// Público: recuperación de contraseña desde el login.
Route::post('/password/codigo', [RecuperacionPasswordController::class, 'enviarCodigo'])->middleware('throttle:3,1');
Route::post('/password/restablecer', [RecuperacionPasswordController::class, 'restablecer'])->middleware('throttle:5,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    // Cualquier rol puede editar sus propios datos.
    Route::patch('/perfil', [PerfilController::class, 'update']);
});

/*
|--------------------------------------------------------------------------
| Gestión de Usuarios
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('usuarios')->group(function () {
    Route::get('/', [UsuarioController::class, 'index'])->middleware('can:usuarios.ver');
    Route::post('/', [UsuarioController::class, 'store'])->middleware('can:usuarios.crear');
    Route::patch('/{usuario}', [UsuarioController::class, 'update'])->middleware('can:usuarios.editar');
    Route::delete('/{usuario}', [UsuarioController::class, 'destroy'])->middleware('can:usuarios.eliminar');

    Route::get('/permisos', [PermisoUsuarioController::class, 'index'])->middleware('can:usuarios.ver');
    Route::put('/{usuario}/permisos', [PermisoUsuarioController::class, 'update'])->middleware('can:usuarios.editar');
});

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
    // Público: el formulario de solicitud de la landing busca y actualiza al encargado.
    Route::get('/{cedula}', [EncargadoController::class, 'show']);
    Route::patch('/{cedula}', [EncargadoController::class, 'update']);
    Route::get(
        '/{cedula}/agrupaciones',
        [AgrupacionController::class, 'index']
    );

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/', [EncargadoController::class, 'index'])->middleware('can:solicitudes.ver');
        Route::post('/', [EncargadoController::class, 'store'])->middleware('can:solicitudes.crear');
        Route::delete('/{cedula}', [EncargadoController::class, 'destroy'])->middleware('can:solicitudes.eliminar');
    });
});

/*
|--------------------------------------------------------------------------
| Agrupaciones
|--------------------------------------------------------------------------
*/

// Público: la landing actualiza la agrupación al enviar una solicitud de un
// encargado existente, y el archivo adjunto se abre como enlace directo.
Route::match(
    ['put', 'patch'],
    'agrupaciones/{agrupacion}',
    [AgrupacionController::class, 'update']
)->name('agrupaciones.update');

Route::get(
    'agrupaciones/{agrupacion}/archivo-adjunto',
    [AgrupacionController::class, 'archivoAdjunto']
);

Route::middleware('auth:sanctum')->group(function () {
    Route::get(
        'agrupaciones',
        [AgrupacionController::class, 'listar']
    )->middleware('can:solicitudes.ver');

    Route::get(
        'agrupaciones/aprobadas',
        [AgrupacionController::class, 'listarAprobadas']
    )->middleware('can:solicitudes.ver');

    Route::apiResource('agrupaciones', AgrupacionController::class)
        ->only(['store', 'show', 'destroy'])
        ->parameters([
            'agrupaciones' => 'agrupacion',
        ])
        ->middlewareFor('show', 'can:solicitudes.ver')
        ->middlewareFor('store', 'can:solicitudes.crear')
        ->middlewareFor('destroy', 'can:solicitudes.eliminar');

    Route::post(
        'agrupaciones/{agrupacion}/participaciones',
        [AgrupacionController::class, 'participaciones']
    )->middleware('can:solicitudes.editar');
});

/*
|--------------------------------------------------------------------------
| Solicitudes de Agrupaciones
|--------------------------------------------------------------------------
*/

Route::prefix('solicitudes-agrupaciones')->group(function () {
    // Público: formularios de solicitud de la landing.
    Route::post(
        '/nueva',
        [SolicitudAgrupacionController::class, 'storeNueva']
    );

    Route::post(
        '/encargado-existente',
        [SolicitudAgrupacionController::class, 'storeParaEncargadoExistente']
    );

    Route::middleware('auth:sanctum')->group(function () {
        // Beneficios también lista las solicitudes aprobadas para asignarles beneficios.
        Route::get(
            '/',
            [SolicitudAgrupacionController::class, 'index']
        )->middleware('permission:solicitudes.ver|beneficios.ver');

        Route::post(
            '/',
            [SolicitudAgrupacionController::class, 'store']
        )->middleware('can:solicitudes.crear');

        Route::get(
            '/{id}',
            [SolicitudAgrupacionController::class, 'show']
        )->middleware('permission:solicitudes.ver|beneficios.ver');

        Route::patch(
            '/{id}/aprobar',
            [SolicitudAgrupacionController::class, 'aprobar']
        )->middleware('can:solicitudes.editar');

        Route::patch(
            '/{id}/rechazar',
            [SolicitudAgrupacionController::class, 'rechazar']
        )->middleware('can:solicitudes.editar');

        Route::post(
            '/{id}/enviar-detalles',
            [SolicitudAgrupacionController::class, 'enviarDetalles']
        )->middleware('can:solicitudes.editar');

        Route::put(
            '/{id}',
            [SolicitudAgrupacionController::class, 'update']
        )->middleware('can:solicitudes.editar');

        Route::delete(
            '/{id}',
            [SolicitudAgrupacionController::class, 'destroy']
        )->middleware('can:solicitudes.eliminar');
    });
});

/*
|--------------------------------------------------------------------------
| Reportes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'can:reportes.ver'])->prefix('reportes')->group(function () {
    Route::get(
        '/agrupaciones',
        [ReporteController::class, 'agrupaciones']
    );

    Route::get(
        '/beneficios',
        [BeneficiosReportController::class, 'index']
    );
});

/*
|--------------------------------------------------------------------------
| Módulo de Beneficios
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    // Catálogos. Los reportes de beneficios también los leen para sus filtros.
    $catalogos = [
        'alimentaciones' => AlimentacionController::class,
        'aulas' => AulaController::class,
        'mobiliarios' => MobiliarioController::class,
        'rutas' => RutaController::class,
        'transportes' => TransporteController::class,
    ];

    foreach ($catalogos as $uri => $controlador) {
        Route::apiResource($uri, $controlador)
            ->parameters(['alimentaciones' => 'alimentacion'])
            ->middlewareFor(['index', 'show'], 'permission:beneficios.ver|reportes.ver')
            ->middlewareFor('store', 'can:beneficios.crear')
            ->middlewareFor('update', 'can:beneficios.editar')
            ->middlewareFor('destroy', 'can:beneficios.eliminar');
    }
});

/*
|--------------------------------------------------------------------------
| Calendario: Eventos, Actividades y Ubicaciones
|--------------------------------------------------------------------------
*/

// Público: el calendario de la landing muestra los eventos y sus actividades.
Route::apiResource(
    'eventos',
    EventoController::class
)->only(['index', 'show']);

Route::get(
    'eventos/{evento}/actividades',
    [ActividadController::class, 'porEvento']
);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('eventos', EventoController::class)
        ->only(['store', 'update', 'destroy'])
        ->middlewareFor('store', 'can:calendario.crear')
        ->middlewareFor('update', 'can:calendario.editar')
        ->middlewareFor('destroy', 'can:calendario.eliminar');

    Route::apiResource('ubicaciones', UbicacionController::class)
        ->parameters([
            'ubicaciones' => 'ubicacion',
        ])
        ->middlewareFor(['index', 'show'], 'can:calendario.ver')
        ->middlewareFor('store', 'can:calendario.crear')
        ->middlewareFor('update', 'can:calendario.editar')
        ->middlewareFor('destroy', 'can:calendario.eliminar');

    Route::get(
        'eventos/{evento}/agrupaciones-aprobadas',
        [ActividadController::class, 'agrupacionesAprobadas']
    )->middleware('can:calendario.ver');

    Route::get(
        'estados-actividad',
        [ActividadController::class, 'estados']
    )->middleware('can:calendario.ver');

    Route::post(
        'actividades/{actividad}/duplicar',
        [ActividadController::class, 'duplicar']
    )->middleware('can:calendario.crear');

    Route::apiResource('actividades', ActividadController::class)
        ->parameters([
            'actividades' => 'actividad',
        ])
        ->middlewareFor(['index', 'show'], 'can:calendario.ver')
        ->middlewareFor('store', 'can:calendario.crear')
        ->middlewareFor('update', 'can:calendario.editar')
        ->middlewareFor('destroy', 'can:calendario.eliminar');
});

/*
|--------------------------------------------------------------------------
| Asignaciones de Beneficios
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('asignaciones-beneficios')->group(function () {
    Route::get(
        '/',
        [AsignacionBeneficiosController::class, 'index']
    )->middleware('can:beneficios.ver');

    Route::post(
        '/',
        [AsignacionBeneficiosController::class, 'store']
    )->middleware('can:beneficios.crear');

    Route::get(
        '/{id}',
        [AsignacionBeneficiosController::class, 'show']
    )->middleware('can:beneficios.ver');

    Route::patch(
        '/{asignacion}',
        [AsignacionBeneficiosController::class, 'update']
    )->middleware('can:beneficios.editar');
});

/*
|--------------------------------------------------------------------------
| Personalización: Patrocinadores
|--------------------------------------------------------------------------
*/

// Público: sección de patrocinadores de la landing (solo activos).
Route::prefix('public')->group(function () {
    Route::get(
        'patrocinadores',
        [PatrocinadorPublicoController::class, 'index']
    );

    Route::get(
        'configuracion-patrocinadores',
        [PatrocinadorPublicoController::class, 'configuracion']
    );
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get(
        'configuracion-patrocinadores',
        [ConfiguracionPatrocinadoresController::class, 'show']
    )->middleware('can:personalizacion.ver');

    Route::put(
        'configuracion-patrocinadores',
        [ConfiguracionPatrocinadoresController::class, 'update']
    )->middleware('can:personalizacion.editar');

    // Antes de 'patrocinadores/{patrocinador}' para que no se confunda con un ID.
    Route::patch(
        'patrocinadores/reordenar',
        [PatrocinadorController::class, 'reordenar']
    )->middleware('can:personalizacion.editar');

    Route::get(
        'patrocinadores',
        [PatrocinadorController::class, 'index']
    )->middleware('can:personalizacion.ver');

    Route::post(
        'patrocinadores',
        [PatrocinadorController::class, 'store']
    )->middleware('can:personalizacion.crear');

    Route::get(
        'patrocinadores/{patrocinador}',
        [PatrocinadorController::class, 'show']
    )->middleware('can:personalizacion.ver');

    Route::put(
        'patrocinadores/{patrocinador}',
        [PatrocinadorController::class, 'update']
    )->middleware('can:personalizacion.editar');

    Route::delete(
        'patrocinadores/{patrocinador}',
        [PatrocinadorController::class, 'destroy']
    )->middleware('can:personalizacion.eliminar');
});

/*
|--------------------------------------------------------------------------
| Personalización: Landing, Correos, Apariencia y galería, Contacto
|--------------------------------------------------------------------------
*/

// Público: textos, contacto, colores, escudo/logo y fotos activas de la landing.
// Nunca incluye los textos de los correos.
Route::get(
    'public/personalizacion',
    [PersonalizacionPublicaController::class, 'index']
);

Route::middleware('auth:sanctum')->prefix('personalizacion')->group(function () {
    // Fotos del Hero y de la galería. 'reordenar' va antes de '{foto}'.
    Route::patch(
        'fotos/reordenar',
        [FotoPersonalizacionController::class, 'reordenar']
    )->middleware('can:personalizacion.editar');

    Route::get(
        'fotos',
        [FotoPersonalizacionController::class, 'index']
    )->middleware('can:personalizacion.ver');

    Route::post(
        'fotos',
        [FotoPersonalizacionController::class, 'store']
    )->middleware('can:personalizacion.crear');

    Route::put(
        'fotos/{foto}',
        [FotoPersonalizacionController::class, 'update']
    )->middleware('can:personalizacion.editar');

    Route::delete(
        'fotos/{foto}',
        [FotoPersonalizacionController::class, 'destroy']
    )->middleware('can:personalizacion.eliminar');

    // Vista previa de un correo con datos de ejemplo: no envía ni guarda nada.
    Route::post(
        'correos/vista-previa',
        VistaPreviaCorreoController::class
    )->middleware('can:personalizacion.ver');

    // Textos de cada sección.
    Route::get(
        '{seccion}',
        [PersonalizacionController::class, 'show']
    )->whereIn('seccion', Predeterminados::SECCIONES)
        ->middleware('can:personalizacion.ver');

    Route::put(
        '{seccion}',
        [PersonalizacionController::class, 'update']
    )->whereIn('seccion', Predeterminados::SECCIONES)
        ->middleware('can:personalizacion.editar');

    // Escudo/logo: subir uno propio o volver al predeterminado.
    Route::post(
        '{seccion}/imagenes/{campo}',
        [PersonalizacionController::class, 'subirImagen']
    )->whereIn('seccion', array_keys(Predeterminados::IMAGENES))
        ->middleware('can:personalizacion.editar');

    Route::delete(
        '{seccion}/imagenes/{campo}',
        [PersonalizacionController::class, 'restaurarImagen']
    )->whereIn('seccion', array_keys(Predeterminados::IMAGENES))
        ->middleware('can:personalizacion.editar');
});
