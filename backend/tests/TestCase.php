<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    /**
     * Única base de datos sobre la que pueden correr las pruebas.
     * Ver incidente del 2026-10-11/12 en AppServiceProvider.
     */
    private const BASE_DE_DATOS_DE_PRUEBAS = 'proyecto_test';

    /**
     * Crea la aplicación y aborta antes de cualquier operación de base de
     * datos (ParallelTesting, RefreshDatabase, DatabaseTruncation, etc.) si
     * la conexión no apunta a proyecto_test.
     *
     * Se comprueba la conexión ya resuelta, no phpunit.xml: así también se
     * detecta una configuración en caché (bootstrap/cache/config.php) o un
     * DB_URL que apunten a otra base. Resolver la conexión no abre el socket
     * (Laravel crea el PDO de forma diferida), así que no toca la base.
     */
    public function createApplication()
    {
        $app = parent::createApplication();

        $baseDeDatosActual = $app['db']->connection()->getDatabaseName();

        if ($baseDeDatosActual !== self::BASE_DE_DATOS_DE_PRUEBAS) {
            throw new RuntimeException(
                "Pruebas abortadas: la conexión apunta a '{$baseDeDatosActual}' y no a '"
                    . self::BASE_DE_DATOS_DE_PRUEBAS . "'. Ejecuta `php artisan config:clear` "
                    . 'y revisa backend/phpunit.xml antes de volver a intentarlo.'
            );
        }

        return $app;
    }
}
