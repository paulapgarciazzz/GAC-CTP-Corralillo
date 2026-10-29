#!/bin/sh
set -e

cd /var/www

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Solo genera APP_KEY si falta: regenerarla en cada arranque invalidaría
# sesiones y cookies cifradas de usuarios que ya estén usando la app.
if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
    php artisan key:generate --force --no-interaction
fi

# Migraciones y seeders nunca se ejecutan sin autorización explícita. Sin
# RUN_MIGRATIONS/RUN_SEEDERS solo se informa qué migraciones están pendientes.
# Lo recomendado es aplicarlas con un contenedor temporal (ver README):
#   docker compose run --rm --no-deps --entrypoint "" app php artisan migrate --force
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    php artisan migrate --force --no-interaction
else
    echo "[entrypoint] RUN_MIGRATIONS no es 'true': no se ejecutan migraciones."
    php artisan migrate:status --pending --no-interaction || true
fi

# Catálogos base y permisos. DatabaseSeeder solo llama seeders idempotentes;
# nunca borra ni duplica datos.
if [ "${RUN_SEEDERS:-false}" = "true" ]; then
    php artisan db:seed --force --no-interaction
else
    echo "[entrypoint] RUN_SEEDERS no es 'true': no se ejecutan seeders."
fi

# Tokens de sensores desde variables de entorno privadas (CONTEO_TOKEN_*).
# Solo guarda el hash en sensor_conteo.token_hash, no reemplaza un token
# distinto ya registrado y sin variables no hace nada. Un fallo (p. ej. la
# base aún no responde) no impide arrancar la aplicación.
php artisan conteo:sincronizar-tokens --no-interaction \
    || echo "[entrypoint] conteo:sincronizar-tokens falló; se continúa el arranque."

chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Sin argumentos (p. ej. con la imagen anterior) arranca php-fpm.
if [ "$#" -eq 0 ]; then
    set -- php-fpm
fi

exec "$@"
