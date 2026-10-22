# GAC-CTP-Corralillo

## Configuración de correo con Resend

El proyecto está preparado para enviar correos mediante Resend. El archivo
`backend/.env.example` mantiene `MAIL_MAILER=log` para desarrollo seguro:
este mailer no envía correos reales, solo registra el contenido en los logs de
Laravel.

### Configuración local

Cada desarrollador debe tener su propio archivo `backend/.env`. Si todavía no
existe, créalo copiando `backend/.env.example`:

```bash
copy backend\.env.example backend\.env
```

Para probar el envío real con Resend, cambia localmente estas variables en
`backend/.env` y reemplaza `SU_CLAVE_LOCAL` por una clave propia:

```dotenv
MAIL_MAILER=resend
RESEND_API_KEY=SU_CLAVE_LOCAL
MAIL_FROM_ADDRESS=sistema@notificaciones.festivaldelatortilla.com
MAIL_FROM_NAME="CTP Corralillo"
```

El subdominio `notificaciones.festivaldelatortilla.com` ya está verificado en
Resend (vía Cloudflare). La API Key debe estar limitada a ese subdominio
("Sending access"), nunca usar una clave con permisos más amplios.

No agregues la clave al repositorio ni la compartas. El archivo `.env` está
ignorado por Git y cada PC (o el servidor institucional) debe tener su propia
clave, generada independientemente desde el panel de Resend.

Desde la carpeta `backend`, ejecuta:

```bash
php artisan key:generate
php artisan optimize:clear
php artisan about
```

`php artisan about` permite revisar el entorno y la configuración general de
Laravel. Ejecuta `optimize:clear` después de modificar el `.env` para que no
quede configuración cacheada.

### Configuración con Docker

Si utilizas Docker Compose, configura las mismas variables en
`backend/.env` y ejecuta los comandos desde la raíz del proyecto:

```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan about
```

El servicio `app` monta la carpeta `backend`, por lo que Laravel lee el
`backend/.env` local dentro del contenedor.

`MAIL_FROM_ADDRESS` debe ser siempre una dirección bajo un dominio/subdominio
verificado en Resend. Actualmente el subdominio verificado es
`notificaciones.festivaldelatortilla.com`; usar un remitente fuera de ese
subdominio (como el genérico `onboarding@resend.dev` de pruebas) hará que
Resend rechace el envío si la API Key está limitada a ese subdominio.

## Pruebas con MariaDB

PHPUnit usa una base MariaDB separada llamada `proyecto_test`. Nunca debe usar
`proyecto_db`, que corresponde al entorno de desarrollo. El archivo
`backend/phpunit.xml` fuerza esta conexión, incluso cuando Docker inyecta las
variables de desarrollo en el contenedor `app`.

El servicio `db` crea `proyecto_test` automáticamente en una instalación nueva
mediante el script de inicialización montado en
`docker/db/init/01-create-test-database.sql`. Si el volumen `db_data` ya
existía antes de agregar ese script, créala una sola vez con:

```bash
docker compose exec db mariadb -uroot -proot_password -e "CREATE DATABASE IF NOT EXISTS proyecto_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON proyecto_test.* TO 'laravel_user'@'%'; FLUSH PRIVILEGES;"
```

Las migraciones de pruebas se ejecutan automáticamente sobre esa base mediante
`RefreshDatabase` al correr PHPUnit. Para preparar manualmente la base sin
riesgo, limpia primero la configuración en caché (si existe, Laravel ignora las
variables de entorno) y usa variables explícitas de testing:

```bash
docker compose exec app php artisan config:clear
docker compose exec app sh -c "DB_CONNECTION=mysql DB_HOST=db DB_PORT=3306 DB_DATABASE=proyecto_test DB_USERNAME=laravel_user DB_PASSWORD=laravel_password php artisan migrate --force"
docker compose exec app composer test
```

`composer test` ejecuta `config:clear` antes de `php artisan test`.

### Protecciones de `proyecto_db`

Tras el incidente del 2026-10-11/12 (un `php artisan test` vació `proyecto_db`
con `migrate:fresh`), hay dos protecciones que no dependen de `phpunit.xml` ni
de los `.env*`, sino de la base de datos ya resuelta en tiempo de ejecución, por
lo que también funcionan con la configuración en caché:

1. `AppServiceProvider` llama a `DB::prohibitDestructiveCommands()` cuando
   **cualquier** conexión configurada apunta a `proyecto_db`, no solo la
   predeterminada, porque `--database=` puede elegir otra. La base de cada
   conexión se calcula aplicando `DB_URL` igual que Laravel al conectarse (la
   URL tiene prioridad sobre `DB_DATABASE`). Si la configuración no se puede
   interpretar, también se bloquea. Así quedan bloqueados `migrate:fresh`,
   `migrate:refresh`, `migrate:reset`, `migrate:rollback` y `db:wipe`, incluso
   con `--force`. `migrate` y `db:seed` siguen permitidos.
2. `tests/TestCase.php` aborta cada prueba al crear la aplicación, antes de
   `RefreshDatabase` o de cualquier otra operación de base de datos, si la
   conexión no apunta a `proyecto_test`.

No uses `migrate:fresh` con el entorno normal ni intentes saltarte estas
protecciones.

### Arranque del contenedor `app` (migraciones y seeders automáticos)

`docker/php/entrypoint.sh` ejecuta en **cada arranque** del contenedor `app`
(`docker compose up`, `restart` o `start`), sobre `proyecto_db`:

```bash
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction
```

Esto aplica las migraciones pendientes y corre `DatabaseSeeder`, incluido
`PermisosSeeder`. Ambos son aditivos y no borran datos, pero se ejecutan sin
pedir confirmación. Para evitar migraciones o seeders no autorizados:

- Antes de levantar `app`, revisa qué migraciones llegaron con el último
  `git pull` (`git diff --stat HEAD@{1} -- backend/database`).
- Para trabajar solo con la base sin disparar el entrypoint, levanta únicamente
  el servicio `db`: `docker compose up -d db`.
- Para consultar el estado de las migraciones sin ejecutar el entrypoint:
  `docker compose run --rm --no-deps --entrypoint "" app php artisan migrate:status`.
- Define `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env`
  antes de levantar `app`. Si faltan, `PermisosSeeder` falla, y como el script
  usa `set -e`, el contenedor se detiene sin arrancar `php-fpm`.