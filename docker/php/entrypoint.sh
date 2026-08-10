#!/bin/sh
set -e

cd /var/www

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi
php artisan key:generate --force --no-interaction
php artisan migrate --force --no-interaction

chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

exec php-fpm
