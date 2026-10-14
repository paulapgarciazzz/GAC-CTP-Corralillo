FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY backend/ /var/www
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN composer install --no-interaction --optimize-autoloader
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

RUN { \
    echo 'post_max_size=10M'; \
    echo 'upload_max_filesize=10M'; \
} > /usr/local/etc/php/conf.d/99-uploads.ini

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]