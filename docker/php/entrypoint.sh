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

php artisan migrate --force --no-interaction

# Catálogos base (estados, tipos de alimentación, etc.). DatabaseSeeder solo
# llama seeders idempotentes basados en upsert; nunca borra ni duplica datos.
php artisan db:seed --force --no-interaction

chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

exec php-fpm
