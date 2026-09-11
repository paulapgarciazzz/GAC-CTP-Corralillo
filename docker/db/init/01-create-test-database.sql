CREATE DATABASE IF NOT EXISTS proyecto_test
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON proyecto_test.* TO 'laravel_user'@'%';
FLUSH PRIVILEGES;
